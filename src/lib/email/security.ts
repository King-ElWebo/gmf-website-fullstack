import { createHmac } from "crypto";

const SECRET = process.env.ADMIN_SESSION_SECRET || "gmf-website-email-secret-fallback-long-random";

export interface SignedActionParams {
  bookingId: string;
  action: "approve" | "reject";
  expiresAt: number; // Expiry timestamp in milliseconds
}

/**
 * Generates a cryptographically signed HMAC token for a given booking action and expiration timestamp.
 */
export function generateActionToken(params: SignedActionParams): string {
  const data = `${params.bookingId}:${params.action}:${params.expiresAt}`;
  const hmac = createHmac("sha256", SECRET);
  hmac.update(data);
  return hmac.digest("hex");
}

/**
 * Verifies if the provided HMAC token matches the expected signature and is not expired.
 */
export function verifyActionToken(
  bookingId: string,
  action: "approve" | "reject",
  expiresAt: number,
  token: string
): boolean {
  // 1. Check expiration
  if (Date.now() > expiresAt) {
    console.warn(`[Security] Token expired. Expiry: ${expiresAt}, Current time: ${Date.now()}`);
    return false;
  }

  // 2. Generate expected token
  const expectedToken = generateActionToken({ bookingId, action, expiresAt });

  // 3. Constant-time or direct string comparison (HMAC matches are long hex strings)
  const isValid = expectedToken === token;
  if (!isValid) {
    console.warn(`[Security] Token signature mismatch for booking ${bookingId}`);
  }
  return isValid;
}
