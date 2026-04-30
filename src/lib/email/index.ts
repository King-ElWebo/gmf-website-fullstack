// Public API of the email module
// Usage: import { sendNewBookingEmails, sendStatusChangeEmail } from "@/lib/email";

export { sendEmail, sendBookingEmail, sendNewBookingEmails, sendStatusChangeEmail } from "./email-service";
export type { SendEmailParams, SendEmailResult, EmailType, BookingEmailContext } from "./types";
