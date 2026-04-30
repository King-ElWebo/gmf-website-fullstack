/**
 * Parameters for sending a single transactional email.
 */
export interface SendEmailParams {
  /** Recipient email address(es) */
  to: string | string[];
  /** Email subject line */
  subject: string;
  /** Plain-text body (always sent as fallback) */
  text: string;
  /** Optional HTML body */
  html?: string;
  /** Optional reply-to address */
  replyTo?: string;
}

/**
 * Result returned by the email service after attempting to send.
 */
export interface SendEmailResult {
  success: boolean;
  /** Resend message ID when successful */
  messageId?: string;
  /** Human-readable error when something went wrong */
  error?: string;
}

/**
 * All mail types the system can send.
 * Used to look up templates and as a logging/auditing key.
 */
export type EmailType =
  | "booking_new_admin"       // Neue Anfrage → Admin/Betreiber
  | "booking_confirmation"    // Eingangsbestätigung → Kunde
  | "booking_approved"        // Anfrage angenommen → Kunde
  | "booking_rejected"        // Anfrage abgelehnt → Kunde
  | "booking_cancelled"       // Stornierung → Kunde
  | "booking_status_changed"; // Allgemeine Statusänderung → Kunde

// ──────────────────────────────────────────────
// Rich item data for email templates
// ──────────────────────────────────────────────

export interface BookingEmailItem {
  /** Product / resource name */
  title: string;
  quantity: number;
  /** e.g. "FIXED", "ON_REQUEST", "FROM_PRICE" */
  priceType?: string;
  /** Human-readable price string, e.g. "120,00 €" */
  displayPrice?: string | null;
  /** Total price in cents for this line (quantity × unit) */
  calculatedTotalPriceCents?: number | null;
}

// ──────────────────────────────────────────────
// Address data for email templates
// ──────────────────────────────────────────────

export interface BookingEmailAddress {
  nameOrCompany?: string;
  addressLine1?: string;
  zip?: string;
  city?: string;
  country?: string;
}

/**
 * Context data passed to email templates when rendering booking-related emails.
 * All optional fields are gracefully handled — missing data is simply omitted from the email.
 */
export interface BookingEmailContext {
  referenceCode: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  startDate: string;   // ISO date string or formatted
  endDate: string;
  deliveryType: string;
  itemCount: number;

  /** Optional list of item names for simple text-only emails */
  itemNames?: string[];

  /** Rich item data with pricing — used by HTML templates */
  items?: BookingEmailItem[];

  /** Customer phone number */
  customerPhone?: string;

  /** Customer delivery / main address */
  customerAddress?: BookingEmailAddress;

  /** Whether billing address is different from delivery address */
  billingAddressSameAsDelivery?: boolean;

  /** Separate billing address (only relevant when billingAddressSameAsDelivery is false) */
  billingAddress?: BookingEmailAddress | null;

  /** Free-text message / special requests from the customer */
  customerMessage?: string;

  /** Optional reason (e.g. rejection reason) */
  reason?: string;

  /** The status the booking transitioned to */
  newStatus?: string;

  /** Current booking status label (for display) */
  statusLabel?: string;

  /** Total price in cents for the whole booking (if determinable) */
  totalPriceCents?: number | null;

  /** Flag indicating if the booking requires individual pricing / manual review */
  hasIndividualPricing?: boolean;
}
