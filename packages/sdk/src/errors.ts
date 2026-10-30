/**
 * Typed errors mapped from Lium's error envelope
 * (https://docs.lium.io/developers/error-codes): every 4xx/5xx carries
 * `error.code`, `error.hint` and `error.request_id`.
 */

export interface LiumErrorEnvelope {
  success?: false;
  error?: { code?: string; message?: string; hint?: string; request_id?: string };
  message?: string;
  detail?: unknown;
  status_code?: number;
  request_id?: string;
  /** rent-by-spec 409 body */
  code?: string;
  constraint?: string;
}

export interface LiumErrorInit {
  status?: number;
  code?: string;
  hint?: string;
  requestId?: string;
  body?: unknown;
  cause?: unknown;
}

export class LiumError extends Error {
  override name = "LiumError";
  readonly status: number | undefined;
  /** Stable machine string from Lium, e.g. `insufficient_balance`. */
  readonly code: string | undefined;
  /** What Lium says to do next. */
  readonly hint: string | undefined;
  /** Quote this to Lium support. */
  readonly requestId: string | undefined;
  readonly body: unknown;

  constructor(message: string, init: LiumErrorInit = {}) {
    super(message, init.cause === undefined ? undefined : { cause: init.cause });
    this.status = init.status;
    this.code = init.code;
    this.hint = init.hint;
    this.requestId = init.requestId;
    this.body = init.body;
  }
}

export class LiumAuthError extends LiumError {
  override name = "LiumAuthError";
}
export class LiumPermissionError extends LiumError {
  override name = "LiumPermissionError";
}
export class LiumInsufficientBalanceError extends LiumPermissionError {
  override name = "LiumInsufficientBalanceError";
}
export class LiumNotFoundError extends LiumError {
  override name = "LiumNotFoundError";
}
export class LiumConflictError extends LiumError {
  override name = "LiumConflictError";
}
/** rent-by-spec found no node; `constraint` names the filter that ruled everything out. */
export class LiumNoMatchError extends LiumConflictError {
  override name = "LiumNoMatchError";
  readonly constraint: string | undefined;
  constructor(message: string, init: LiumErrorInit & { constraint?: string } = {}) {
    super(message, init);
    this.constraint = init.constraint;
  }
}
export class LiumValidationError extends LiumError {
  override name = "LiumValidationError";
}
export class LiumRateLimitError extends LiumError {
  override name = "LiumRateLimitError";
}
export class LiumServerError extends LiumError {
  override name = "LiumServerError";
}
/** A pod reached a terminal status (or timed out) before it became ready. */
export class PodStartError extends LiumError {
  override name = "PodStartError";
}
export class LiumSSHError extends LiumError {
  override name = "LiumSSHError";
}
/** The local budget guard refused a rent, or stopped pods at the cap. */
export class BudgetExceededError extends LiumError {
  override name = "BudgetExceededError";
}

/** Codes that mean "this node is gone or busy, try the next one". */
export const NODE_TAKEN_CODES = new Set([
  "node_unavailable",
  "node_rent_in_progress",
  "node_not_verified",
  "node_paused_by_provider",
  "provider_banned",
  "node_below_bandwidth_floor",
  "node_not_found",
  "gpu_count_invalid",
  "gpu_split_not_allowed",
  "conflict",
]);

export function errorFromResponse(status: number, body: unknown, fallback = "Lium API request failed"): LiumError {
  const env = (body && typeof body === "object" ? body : {}) as LiumErrorEnvelope;
  const code = env.error?.code ?? env.code;
  const message =
    env.error?.message ?? env.message ?? (typeof env.detail === "string" ? env.detail : undefined) ?? `${fallback} (HTTP ${status})`;
  const init: LiumErrorInit = {
    status,
    code,
    hint: env.error?.hint,
    requestId: env.error?.request_id ?? env.request_id,
    body,
  };
  if (code === "no_executor_matches_spec" || env.constraint) {
    return new LiumNoMatchError(message, { ...init, code: code ?? "no_executor_matches_spec", constraint: env.constraint });
  }
  if (status === 401) return new LiumAuthError(message, init);
  if (code === "insufficient_balance" || code === "BALANCE_REQUIRED") return new LiumInsufficientBalanceError(message, init);
  if (status === 403) return new LiumPermissionError(message, init);
  if (status === 404) return new LiumNotFoundError(message, init);
  if (status === 409) return new LiumConflictError(message, init);
  if (status === 422) return new LiumValidationError(message, init);
  if (status === 429) return new LiumRateLimitError(message, init);
  if (status >= 500) return new LiumServerError(message, init);
  return new LiumError(message, init);
}
