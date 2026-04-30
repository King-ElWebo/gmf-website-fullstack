import { getResendClient } from "./resend-client";
import { renderEmailTemplate } from "./templates";
import type {
  BookingEmailContext,
  EmailType,
  SendEmailParams,
  SendEmailResult,
} from "./types";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

/** Sender address — must match a verified domain in Resend */
const DEFAULT_FROM =
  process.env.EMAIL_FROM || "GMF Events <noreply@example.com>";

/** Admin/operator email that receives new-booking notifications */
const ADMIN_EMAIL = process.env.EMAIL_ADMIN || "";

/**
 * Master kill-switch: set to "true" to actually send emails.
 * Defaults to "false" so no mails go out until explicitly enabled.
 */
function isEmailEnabled(): boolean {
  return process.env.EMAIL_ENABLED === "true";
}

// ──────────────────────────────────────────────
// Core send function
// ──────────────────────────────────────────────

/**
 * Sends a single transactional email via Resend.
 *
 * - Never throws — returns a result object instead.
 * - Skipped silently when EMAIL_ENABLED !== "true".
 */
export async function sendEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  if (!isEmailEnabled()) {
    console.log(
      `[Email] Sending disabled (EMAIL_ENABLED != true). Would have sent "${params.subject}" to ${
        Array.isArray(params.to) ? params.to.join(", ") : params.to
      }`
    );
    return { success: true, messageId: "disabled" };
  }

  try {
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html,
      replyTo: params.replyTo,
    });

    if (error) {
      console.error("[Email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    console.log(
      `[Email] Sent "${params.subject}" to ${
        Array.isArray(params.to) ? params.to.join(", ") : params.to
      } (id: ${data?.id})`
    );
    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Email] Unexpected error:", message);
    return { success: false, error: message };
  }
}

// ──────────────────────────────────────────────
// High-level booking email helpers
// ──────────────────────────────────────────────

/**
 * Sends a booking-related email by rendering the appropriate template.
 * Failures are logged but never propagated — the booking flow must not break
 * because of an email issue.
 */
export async function sendBookingEmail(
  type: EmailType,
  ctx: BookingEmailContext,
  overrideTo?: string
): Promise<SendEmailResult> {
  const rendered = renderEmailTemplate(type, ctx);

  const to = overrideTo || ctx.customerEmail;
  return sendEmail({
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}

/**
 * Fires both emails that should go out when a new booking request is created:
 *  1. Confirmation email → Customer
 *  2. Notification email → Admin/Operator
 *
 * Both are fire-and-forget; failures are logged.
 */
export async function sendNewBookingEmails(
  ctx: BookingEmailContext
): Promise<void> {
  // 1. Customer confirmation
  const confirmResult = await sendBookingEmail("booking_confirmation", ctx);
  if (!confirmResult.success) {
    console.warn(
      `[Email] Customer confirmation for ${ctx.referenceCode} failed:`,
      confirmResult.error
    );
  }

  // 2. Admin notification
  if (ADMIN_EMAIL) {
    const adminResult = await sendBookingEmail(
      "booking_new_admin",
      ctx,
      ADMIN_EMAIL
    );
    if (!adminResult.success) {
      console.warn(
        `[Email] Admin notification for ${ctx.referenceCode} failed:`,
        adminResult.error
      );
    }
  } else {
    console.warn(
      "[Email] EMAIL_ADMIN not set — skipping admin notification for new booking."
    );
  }
}

/**
 * Sends the right email when a booking status changes.
 * Maps status values to EmailType automatically.
 */
export async function sendStatusChangeEmail(
  newStatus: string,
  ctx: BookingEmailContext
): Promise<void> {
  const typeMap: Record<string, EmailType> = {
    approved: "booking_approved",
    rejected: "booking_rejected",
    cancelled: "booking_cancelled",
  };

  const emailType: EmailType = typeMap[newStatus] || "booking_status_changed";
  ctx.newStatus = newStatus;

  const result = await sendBookingEmail(emailType, ctx);
  if (!result.success) {
    console.warn(
      `[Email] Status-change email (${newStatus}) for ${ctx.referenceCode} failed:`,
      result.error
    );
  }
}
