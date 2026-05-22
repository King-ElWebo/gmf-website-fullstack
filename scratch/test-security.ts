import { generateActionToken, verifyActionToken } from "../src/lib/email/security";

async function testSecurity() {
  console.log("=== Testing Secure Email Action Tokens ===");

  const bookingId = "test-booking-id-123";
  const expiresAt = Date.now() + 1000 * 60 * 5; // Valid for 5 minutes

  // 1. Generate Token
  const token = generateActionToken({
    bookingId,
    action: "approve",
    expiresAt,
  });
  console.log(`Generated Token: ${token}`);

  // 2. Verify Valid Token
  const isValid = verifyActionToken(bookingId, "approve", expiresAt, token);
  console.log(`Verification (valid case): ${isValid ? "SUCCESS" : "FAILED"}`);

  // 3. Verify Malicious Tampering of Action
  const isActionTamperedValid = verifyActionToken(bookingId, "reject", expiresAt, token);
  console.log(`Verification (action tampered): ${isActionTamperedValid ? "FAILED" : "SUCCESS (Rejected invalid action)"}`);

  // 4. Verify Malicious Tampering of Booking ID
  const isIdTamperedValid = verifyActionToken("different-id", "approve", expiresAt, token);
  console.log(`Verification (id tampered): ${isIdTamperedValid ? "FAILED" : "SUCCESS (Rejected invalid ID)"}`);

  // 5. Verify Expiration
  const pastExpiry = Date.now() - 1000 * 60; // Expired 1 minute ago
  const expiredToken = generateActionToken({
    bookingId,
    action: "approve",
    expiresAt: pastExpiry,
  });
  const isExpiredValid = verifyActionToken(bookingId, "approve", pastExpiry, expiredToken);
  console.log(`Verification (expired case): ${isExpiredValid ? "FAILED" : "SUCCESS (Rejected expired token)"}`);
}

testSecurity().catch(console.error);
