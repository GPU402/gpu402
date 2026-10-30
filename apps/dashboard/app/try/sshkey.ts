/**
 * An Ed25519 SSH key pair made in this browser with WebCrypto, in OpenSSH formats.
 * The private key never leaves the page unless the visitor downloads it.
 */
export interface SshKeyPair {
  publicKey: string;
  privateKey: string;
}

const enc = new TextEncoder();

function u32(n: number) {
  return new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
}
function cat(...parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let o = 0;
  for (const p of parts) out.set(p, (o += p.length) - p.length);
  return out;
}
/** SSH wire "string": length-prefixed bytes. */
const str = (b: Uint8Array | string) => {
  const bytes = typeof b === "string" ? enc.encode(b) : b;
  return cat(u32(bytes.length), bytes);
};
const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));

export const canMakeSshKeys = () => typeof crypto !== "undefined" && Boolean(crypto.subtle);

export async function makeSshKeyPair(comment = "gpu402-browser"): Promise<SshKeyPair> {
  const kp = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])) as CryptoKeyPair;
  const pub = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  // PKCS#8 for Ed25519 ends with the 32-byte seed.
  const seed = new Uint8Array(await crypto.subtle.exportKey("pkcs8", kp.privateKey)).slice(-32);

  const pubBlob = cat(str("ssh-ed25519"), str(pub));
  const check = crypto.getRandomValues(new Uint32Array(1))[0]!;
  let priv = cat(u32(check), u32(check), str("ssh-ed25519"), str(pub), str(cat(seed, pub)), str(comment));
  const pad: number[] = [];
  for (let i = 1; (priv.length + pad.length) % 8 !== 0; i++) pad.push(i);
  priv = cat(priv, new Uint8Array(pad));

  const body = cat(enc.encode("openssh-key-v1\0"), str("none"), str("none"), str(""), u32(1), str(pubBlob), str(priv));
  const lines = b64(body).match(/.{1,70}/g)!.join("\n");
  return {
    publicKey: `ssh-ed25519 ${b64(pubBlob)} ${comment}`,
    privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----\n${lines}\n-----END OPENSSH PRIVATE KEY-----\n`,
  };
}
