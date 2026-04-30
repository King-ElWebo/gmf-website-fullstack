import { Resend } from "resend";

let resendInstance: Resend | null = null;

/**
 * Returns the singleton Resend client instance.
 * Throws at call-time (not import-time) if the API key is missing,
 * so the rest of the app still boots when email isn't configured.
 */
export function getResendClient(): Resend {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[Email] RESEND_API_KEY is not set. Add it to your .env file to enable email sending."
    );
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}
