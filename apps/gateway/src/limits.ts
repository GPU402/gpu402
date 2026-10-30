import type { Context, MiddlewareHandler } from "hono";

/** Client address: the first X-Forwarded-For hop when behind a trusted proxy, else the socket address. */
export function clientIp(c: Context, trustProxy: boolean): string {
  if (trustProxy) {
    const fwd = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    if (fwd) return fwd;
  }
  const env = c.env as { incoming?: { socket?: { remoteAddress?: string } } } | undefined;
  return env?.incoming?.socket?.remoteAddress ?? "local";
}

/**
 * Fixed-window rate limit per client and route group, in memory. Enough for a
 * single gateway instance; put a shared limiter in front when running several.
 */
export function rateLimit(opts: { windowMs: number; max: number; trustProxy: boolean; name: string }): MiddlewareHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }, opts.windowMs);
  sweep.unref();

  return async (c, next) => {
    const key = clientIp(c, opts.trustProxy);
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      hits.set(key, entry);
    }
    entry.count++;
    c.header("RateLimit-Limit", String(opts.max));
    c.header("RateLimit-Remaining", String(Math.max(opts.max - entry.count, 0)));
    if (entry.count > opts.max) {
      const retry = Math.ceil((entry.resetAt - now) / 1000);
      c.header("Retry-After", String(retry));
      return c.json({ error: "rate_limited", message: `Too many ${opts.name} requests; retry in ${retry} s.` }, 429);
    }
    await next();
  };
}
