import { createHash, timingSafeEqual } from "node:crypto";
import { decodeProtectedHeader, importJWK, jwtVerify, type JWK } from "jose";
import { getPlaidClient } from "@/lib/plaid";

// Plaid signs every webhook with an ES256 JWT in the `Plaid-Verification`
// header. The JWT body carries `request_body_sha256` — the SHA-256 of the
// raw request body. We verify the signature against Plaid's published key
// and confirm the body hash matches, which proves the request genuinely
// came from Plaid and was not tampered with or replayed.
//
// See: https://plaid.com/docs/api/webhooks/webhook-verification/

// Cache verification keys by kid — they rotate rarely and a fetch per
// webhook would add latency. Keys are public, so caching is safe.
const keyCache = new Map<string, JWK>();

function hexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export async function verifyPlaidWebhook(
  rawBody: string,
  verificationHeader: string | null,
): Promise<boolean> {
  if (!verificationHeader) return false;

  let kid: string;
  try {
    const header = decodeProtectedHeader(verificationHeader);
    if (header.alg !== "ES256" || typeof header.kid !== "string") return false;
    kid = header.kid;
  } catch {
    return false;
  }

  let jwk = keyCache.get(kid);
  if (!jwk) {
    try {
      const plaid = getPlaidClient();
      const res = await plaid.webhookVerificationKeyGet({ key_id: kid });
      const key = res.data.key;
      // A non-null expired_at means Plaid has retired this key.
      if (key.expired_at) return false;
      jwk = key as unknown as JWK;
      keyCache.set(kid, jwk);
    } catch {
      return false;
    }
  }

  let payload: Record<string, unknown>;
  try {
    const publicKey = await importJWK(jwk, "ES256");
    const verified = await jwtVerify(verificationHeader, publicKey, {
      // Reject anything older than 5 minutes — replay protection.
      maxTokenAge: "5 min",
    });
    payload = verified.payload as Record<string, unknown>;
  } catch {
    return false;
  }

  const claimedHash = payload.request_body_sha256;
  if (typeof claimedHash !== "string") return false;

  const actualHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
  return hexEqual(claimedHash, actualHash);
}
