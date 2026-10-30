import { OWNERSHIP_HEADERS, OWNERSHIP_WINDOW_SEC, ownershipMessage } from "gpu402";
import { verifyMessage, type Hex } from "viem";

export type OwnershipResult = { ok: true } | { ok: false; status: 401 | 403; error: string };

/** Checks that the request carries a fresh EIP-191 signature of the pod's ownership message by the paying wallet. */
export async function verifyOwnership(
  podId: string,
  payer: string | null,
  header: (name: string) => string | undefined,
  now = Date.now(),
): Promise<OwnershipResult> {
  const ts = Number(header(OWNERSHIP_HEADERS.timestamp));
  const signature = header(OWNERSHIP_HEADERS.signature);
  if (!signature || !Number.isFinite(ts)) {
    return {
      ok: false,
      status: 401,
      error: `Sign "${ownershipMessage(podId, Math.floor(now / 1000)).replace(/\n/g, "\\n")}" with the paying wallet and send ${OWNERSHIP_HEADERS.timestamp} and ${OWNERSHIP_HEADERS.signature}.`,
    };
  }
  if (Math.abs(now / 1000 - ts) > OWNERSHIP_WINDOW_SEC) {
    return { ok: false, status: 401, error: `Signature timestamp is outside the ${OWNERSHIP_WINDOW_SEC} s window.` };
  }
  if (!payer) return { ok: false, status: 403, error: "This pod has no settled payer yet." };
  const valid = await verifyMessage({
    address: payer as Hex,
    message: ownershipMessage(podId, ts),
    signature: signature as Hex,
  }).catch(() => false);
  return valid ? { ok: true } : { ok: false, status: 403, error: "Signature is not from the wallet that paid for this pod." };
}
