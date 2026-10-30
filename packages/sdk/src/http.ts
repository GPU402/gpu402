/**
 * A fetch wrapper that retries with exponential backoff and jitter on 429
 * and 5xx, honours `Retry-After`, and only retries a POST when it carries an
 * `Idempotency-Key` (Lium makes such retries safe).
 */

export interface RetryOptions {
  /** Retries after the first attempt. Default 3. */
  maxRetries?: number;
  /** First backoff delay. Default 500 ms. */
  baseDelayMs?: number;
  /** Upper bound for one backoff delay. Default 8 s. */
  maxDelayMs?: number;
  onRetry?: (info: { attempt: number; delayMs: number; status?: number; error?: unknown; url: string }) => void;
}

const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]);

export const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(signal.reason);
      },
      { once: true },
    );
  });

export function backoffDelay(attempt: number, base: number, max: number, retryAfter?: string | null): number {
  if (retryAfter) {
    const secs = Number(retryAfter);
    if (Number.isFinite(secs)) return Math.min(secs * 1000, max * 4);
    const at = Date.parse(retryAfter);
    if (Number.isFinite(at)) return Math.min(Math.max(at - Date.now(), 0), max * 4);
  }
  const exp = Math.min(base * 2 ** attempt, max);
  return Math.round(exp / 2 + Math.random() * (exp / 2));
}

export function createRetryingFetch(baseFetch: typeof fetch = globalThis.fetch, opts: RetryOptions = {}): typeof fetch {
  const maxRetries = opts.maxRetries ?? 3;
  const base = opts.baseDelayMs ?? 500;
  const max = opts.maxDelayMs ?? 8_000;

  return async function retryingFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const request = new Request(input, init);
    const retryable = SAFE_METHODS.has(request.method) || request.headers.has("Idempotency-Key");

    for (let attempt = 0; ; attempt++) {
      const last = !retryable || attempt >= maxRetries;
      try {
        const res = await baseFetch(request.clone());
        if (last || !RETRY_STATUS.has(res.status)) return res;
        const delayMs = backoffDelay(attempt, base, max, res.headers.get("Retry-After"));
        opts.onRetry?.({ attempt: attempt + 1, delayMs, status: res.status, url: request.url });
        await res.body?.cancel().catch(() => {});
        await sleep(delayMs, request.signal);
      } catch (error) {
        if (last || request.signal.aborted) throw error;
        const delayMs = backoffDelay(attempt, base, max);
        opts.onRetry?.({ attempt: attempt + 1, delayMs, error, url: request.url });
        await sleep(delayMs, request.signal);
      }
    }
  };
}
