import type { BookingEmailContext, EmailType } from "./types";
import {
  htmlLayout,
  sectionHeading,
  highlightBox,
  reasonBox,
  messageBox,
  itemsTable,
  customerDetailsBlock,
  addressBlock,
  bookingSummaryBlock,
  statusBadge,
  esc,
  formatDateDE,
  deliveryLabel,
  formatCentsEuro,
} from "./html-layout";
import { generateActionToken } from "./security";


// ──────────────────────────────────────────────
// Template rendering helpers
// ──────────────────────────────────────────────

interface RenderedTemplate {
  subject: string;
  text: string;
  html: string;
}

/**
 * Renders the email subject + body (plain-text AND HTML) for a given EmailType and context.
 * Falls back to a generic status-change template for unknown types.
 */
export function renderEmailTemplate(
  type: EmailType,
  ctx: BookingEmailContext
): RenderedTemplate {
  switch (type) {
    case "booking_new_admin":
      return renderNewBookingAdmin(ctx);
    case "booking_confirmation":
      return renderBookingConfirmation(ctx);
    case "booking_approved":
      return renderBookingApproved(ctx);
    case "booking_rejected":
      return renderBookingRejected(ctx);
    case "booking_cancelled":
      return renderBookingCancelled(ctx);
    case "booking_status_changed":
      return renderStatusChanged(ctx);
    default:
      return renderStatusChanged(ctx);
  }
}

// ──────────────────────────────────────────────
// Plain-text helpers
// ──────────────────────────────────────────────

function textItemList(ctx: BookingEmailContext): string {
  if (ctx.items?.length) {
    return ctx.items
      .map((i) => {
        let line = `  • ${i.title} (×${i.quantity})`;
        if (i.priceType === "ON_REQUEST") {
          line += " – Preis auf Anfrage";
        } else if (i.calculatedTotalPriceCents != null) {
          line += ` – ${formatCentsEuro(i.calculatedTotalPriceCents)}`;
        } else if (i.displayPrice) {
          line += ` – ${i.displayPrice}`;
        }
        return line;
      })
      .join("\n");
  }
  if (ctx.itemNames?.length) {
    return ctx.itemNames.map((n) => `  • ${n}`).join("\n");
  }
  return `  ${ctx.itemCount} Produkt(e)`;
}

function textAddress(label: string, addr?: { nameOrCompany?: string; addressLine1?: string; zip?: string; city?: string; country?: string } | null): string {
  if (!addr) return "";
  const lines: string[] = [];
  if (addr.nameOrCompany) lines.push(addr.nameOrCompany);
  if (addr.addressLine1) lines.push(addr.addressLine1);
  const zipCity = [addr.zip, addr.city].filter(Boolean).join(" ");
  if (zipCity) lines.push(zipCity);
  if (addr.country) lines.push(addr.country);
  if (lines.length === 0) return "";
  return `\n${label}:\n${lines.map((l) => `  ${l}`).join("\n")}`;
}

function textDateRange(ctx: BookingEmailContext): string {
  return `${formatDateDE(ctx.startDate)} – ${formatDateDE(ctx.endDate)}`;
}

// ──────────────────────────────────────────────
// 1. Neue Anfrage → Admin
// ──────────────────────────────────────────────

function renderNewBookingAdmin(ctx: BookingEmailContext): RenderedTemplate {
  const subject = `Neue Anfrage ${ctx.referenceCode}`;
  const baseUrl = process.env.APP_URL || "http://localhost:3000";

  let linksText = "";
  let linksHtml = "";

  if (ctx.bookingId) {
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 Tage Gültigkeit
    const approveToken = generateActionToken({
      bookingId: ctx.bookingId,
      action: "approve",
      expiresAt,
    });
    const rejectToken = generateActionToken({
      bookingId: ctx.bookingId,
      action: "reject",
      expiresAt,
    });

    const approveUrl = `${baseUrl}/bookings/action?bookingId=${ctx.bookingId}&action=approve&expiresAt=${expiresAt}&token=${approveToken}`;
    const rejectUrl = `${baseUrl}/bookings/action?bookingId=${ctx.bookingId}&action=reject&expiresAt=${expiresAt}&token=${rejectToken}`;
    const adminUrl = `${baseUrl}/admin/bookings/${ctx.bookingId}`;

    linksText = `\n\nAKTIONEN:\n- Anfrage im Admin-Bereich ansehen (EMPFOHLEN):\n  ${adminUrl}\n\n- Schnell annehmen:\n  ${approveUrl}\n- Schnell ablehnen:\n  ${rejectUrl}\n\nBitte prüfen Sie die Anfrage im Admin-Bereich, bevor Sie sie bestätigen. Die Schnellaktionen sind nur für eindeutige Fälle gedacht.\n`;

    linksHtml = `
      <div style="margin: 24px 0; padding: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;">
        <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Aktionen</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: 100%; max-width: 320px;">
          <tr>
            <td style="padding: 0 0 16px 0;">
              <a href="${adminUrl}" style="display: block; padding: 14px 28px; font-family: 'Nunito', Arial, sans-serif; font-size: 15px; font-weight: 700; color: #ffffff; background-color: #2563eb; text-decoration: none; border-radius: 8px; text-align: center; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: all 0.2s ease;">Anfrage im Admin-Bereich ansehen</a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #4b5563; line-height: 1.5;">Bitte pr&uuml;fen Sie die Anfrage im Admin-Bereich, bevor Sie sie best&auml;tigen. Die Schnellaktionen sind nur f&uuml;r eindeutige F&auml;lle gedacht.</p>
        
        <div style="border-top: 1px solid #e5e7eb; margin: 16px 0; padding-top: 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: auto;">
            <tr>
              <td style="padding: 0 8px;">
                <a href="${approveUrl}" style="display: inline-block; padding: 8px 16px; font-family: 'Nunito', Arial, sans-serif; font-size: 12px; font-weight: 600; color: #10b981; background-color: transparent; border: 1px solid #10b981; text-decoration: none; border-radius: 6px; text-align: center; transition: all 0.2s ease;">Schnell annehmen</a>
              </td>
              <td style="padding: 0 8px;">
                <a href="${rejectUrl}" style="display: inline-block; padding: 8px 16px; font-family: 'Nunito', Arial, sans-serif; font-size: 12px; font-weight: 600; color: #ef4444; background-color: transparent; border: 1px solid #ef4444; text-decoration: none; border-radius: 6px; text-align: center; transition: all 0.2s ease;">Schnell ablehnen</a>
              </td>
            </tr>
          </table>
        </div>
        <p style="margin: 16px 0 0 0; font-size: 11px; color: #9ca3af; line-height: 1.4;">Diese Schnellaktions-Links sind 7 Tage g&uuml;ltig und kryptografisch signiert.</p>
      </div>
    `;
  }

  // ── Plain text ──
  const textParts = [
    `Neue Anfrage eingegangen!`,
    ``,
    `Referenz: ${ctx.referenceCode}`,
    `Kunde: ${ctx.customerFirstName} ${ctx.customerLastName}`,
    `E-Mail: ${ctx.customerEmail}`,
  ];
  if (ctx.customerPhone) textParts.push(`Telefon: ${ctx.customerPhone}`);
  textParts.push(
    `Zeitraum: ${textDateRange(ctx)}`,
    `Lieferart: ${deliveryLabel(ctx.deliveryType)}`,
    ``,
    `Produkte:`,
    textItemList(ctx),
  );
  const addrText = textAddress("Lieferadresse", ctx.customerAddress);
  if (addrText) textParts.push(addrText);
  if (ctx.billingAddressSameAsDelivery === false && ctx.billingAddress) {
    const bAddr = textAddress("Rechnungsadresse", ctx.billingAddress);
    if (bAddr) textParts.push(bAddr);
  }
  if (ctx.customerMessage) {
    textParts.push(``, `Nachricht des Kunden:`, `  „${ctx.customerMessage}"`);
  }

  if (linksText) {
    textParts.push(linksText);
  } else {
    textParts.push(``, `Bitte im Admin-Dashboard prüfen und bearbeiten.`);
  }

  // ── HTML ──
  let body = `
    <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#1f2937;">Neue Anfrage eingegangen</h2>
    <p style="margin:0 0 16px 0;font-size:15px;color:#6b7280;">Eine neue Buchungsanfrage wartet auf Ihre Bearbeitung.</p>
  `;

  body += highlightBox(`
    <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Referenz-Nr.</p>
    <p style="margin:4px 0 0 0;font-size:20px;font-weight:700;color:#1f2937;">${esc(ctx.referenceCode)}</p>
  `);

  body += sectionHeading("Kundendaten");
  body += customerDetailsBlock(ctx);

  body += sectionHeading("Buchungsdetails");
  body += bookingSummaryBlock(ctx);

  if (ctx.items?.length) {
    body += sectionHeading("Angefragte Produkte");
    body += itemsTable(ctx.items);
  }

  body += addressBlock(ctx);

  if (ctx.customerMessage) {
    body += sectionHeading("Nachricht des Kunden");
    body += messageBox(ctx.customerMessage);
  }

  if (linksHtml) {
    body += linksHtml;
  }

  return {
    subject,
    text: textParts.join("\n"),
    html: htmlLayout(subject, body),
  };
}

// ──────────────────────────────────────────────
// 2. Eingangsbestätigung → Kunde
// ──────────────────────────────────────────────

function renderBookingConfirmation(ctx: BookingEmailContext): RenderedTemplate {
  const subject = `Ihre Anfrage ${ctx.referenceCode} ist eingegangen`;

  // ── Plain text ──
  const textParts = [
    `Hallo ${ctx.customerFirstName},`,
    ``,
    `vielen Dank für Ihre Anfrage (${ctx.referenceCode}).`,
    ``,
    `Zeitraum: ${textDateRange(ctx)}`,
    `Lieferart: ${deliveryLabel(ctx.deliveryType)}`,
    ``,
    `Produkte:`,
    textItemList(ctx),
  ];
  if (ctx.customerMessage) {
    textParts.push(``, `Ihre Nachricht:`, `  „${ctx.customerMessage}"`);
  }
  textParts.push(
    ``,
    `Wir werden Ihre Anfrage schnellstmöglich prüfen und uns bei Ihnen melden.`,
    ``,
    `Mit freundlichen Grüßen,`,
    `Ihr GMF-Team`,
  );

  // ── HTML ──
  let body = `
    <p style="margin:0 0 4px 0;font-size:15px;color:#1f2937;">Hallo <strong>${esc(ctx.customerFirstName)}</strong>,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#1f2937;">vielen Dank für Ihre Anfrage! Wir haben diese erfolgreich erhalten und werden sie schnellstmöglich bearbeiten.</p>
  `;

  body += highlightBox(`
    <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Ihre Referenz-Nr.</p>
    <p style="margin:4px 0 0 0;font-size:20px;font-weight:700;color:#1f2937;">${esc(ctx.referenceCode)}</p>
  `);

  body += sectionHeading("Ihre Buchungsdetails");
  body += bookingSummaryBlock(ctx);

  if (ctx.items?.length) {
    body += sectionHeading("Angefragte Produkte");
    body += itemsTable(ctx.items);
  }

  body += addressBlock(ctx);

  if (ctx.customerMessage) {
    body += sectionHeading("Ihre Nachricht");
    body += messageBox(ctx.customerMessage);
  }

  body += `<p style="margin:24px 0 0 0;font-size:15px;color:#1f2937;">Wir melden uns bei Ihnen, sobald wir Ihre Anfrage geprüft haben.</p>`;
  body += `<p style="margin:16px 0 0 0;font-size:15px;color:#1f2937;">Mit freundlichen Grüßen,<br><strong>Ihr GMF-Team</strong></p>`;

  return {
    subject,
    text: textParts.join("\n"),
    html: htmlLayout(subject, body),
  };
}

// ──────────────────────────────────────────────
// 3. Anfrage bestätigt → Kunde
// ──────────────────────────────────────────────

function renderBookingApproved(ctx: BookingEmailContext): RenderedTemplate {
  const subject = `Ihre Anfrage ${ctx.referenceCode} wurde bestätigt`;

  // ── Plain text ──
  const textParts = [
    `Hallo ${ctx.customerFirstName},`,
    ``,
    `gute Nachrichten! Ihre Anfrage (${ctx.referenceCode}) wurde bestätigt.`,
    ``,
    `Zeitraum: ${textDateRange(ctx)}`,
    `Lieferart: ${deliveryLabel(ctx.deliveryType)}`,
    ``,
    `Produkte:`,
    textItemList(ctx),
    ``,
    `Wir melden uns bei Ihnen mit weiteren Details zur Abwicklung.`,
    ``,
    `Mit freundlichen Grüßen,`,
    `Ihr GMF-Team`,
  ];

  // ── HTML ──
  let body = `
    <p style="margin:0 0 4px 0;font-size:15px;color:#1f2937;">Hallo <strong>${esc(ctx.customerFirstName)}</strong>,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#1f2937;">gute Nachrichten! Ihre Anfrage wurde bestätigt. &#127881;</p>
  `;

  body += highlightBox(`
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Referenz-Nr.</p>
          <p style="margin:4px 0 0 0;font-size:20px;font-weight:700;color:#1f2937;">${esc(ctx.referenceCode)}</p>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          ${statusBadge("approved")}
        </td>
      </tr>
    </table>
  `);

  body += sectionHeading("Buchungsdetails");
  body += bookingSummaryBlock(ctx);

  if (ctx.items?.length) {
    body += sectionHeading("Bestätigte Produkte");
    body += itemsTable(ctx.items);
  }

  body += addressBlock(ctx);

  body += `<p style="margin:24px 0 0 0;font-size:15px;color:#1f2937;">Wir melden uns bei Ihnen mit weiteren Details zur Abwicklung.</p>`;
  body += `<p style="margin:16px 0 0 0;font-size:15px;color:#1f2937;">Mit freundlichen Grüßen,<br><strong>Ihr GMF-Team</strong></p>`;

  return {
    subject,
    text: textParts.join("\n"),
    html: htmlLayout(subject, body),
  };
}

// ──────────────────────────────────────────────
// 4. Anfrage abgelehnt → Kunde
// ──────────────────────────────────────────────

function renderBookingRejected(ctx: BookingEmailContext): RenderedTemplate {
  const subject = `Ihre Anfrage ${ctx.referenceCode} konnte leider nicht bestätigt werden`;

  // ── Plain text ──
  const reasonBlock = ctx.reason
    ? [``, `Begründung: ${ctx.reason}`]
    : [];
  const textParts = [
    `Hallo ${ctx.customerFirstName},`,
    ``,
    `leider können wir Ihre Anfrage (${ctx.referenceCode}) nicht bestätigen.`,
    ...reasonBlock,
    ``,
    `Zeitraum: ${textDateRange(ctx)}`,
    ``,
    `Produkte:`,
    textItemList(ctx),
    ``,
    `Bei Fragen stehen wir Ihnen gerne zur Verfügung.`,
    ``,
    `Mit freundlichen Grüßen,`,
    `Ihr GMF-Team`,
  ];

  // ── HTML ──
  let body = `
    <p style="margin:0 0 4px 0;font-size:15px;color:#1f2937;">Hallo <strong>${esc(ctx.customerFirstName)}</strong>,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#1f2937;">leider können wir Ihre Anfrage nicht bestätigen.</p>
  `;

  body += highlightBox(`
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Referenz-Nr.</p>
          <p style="margin:4px 0 0 0;font-size:20px;font-weight:700;color:#1f2937;">${esc(ctx.referenceCode)}</p>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          ${statusBadge("rejected")}
        </td>
      </tr>
    </table>
  `);

  if (ctx.reason) {
    body += reasonBox(ctx.reason);
  }

  body += sectionHeading("Angefragte Buchung");
  body += bookingSummaryBlock(ctx);

  if (ctx.items?.length) {
    body += sectionHeading("Angefragte Produkte");
    body += itemsTable(ctx.items);
  }

  body += `<p style="margin:24px 0 0 0;font-size:15px;color:#1f2937;">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>`;
  body += `<p style="margin:16px 0 0 0;font-size:15px;color:#1f2937;">Mit freundlichen Grüßen,<br><strong>Ihr GMF-Team</strong></p>`;

  return {
    subject,
    text: textParts.join("\n"),
    html: htmlLayout(subject, body),
  };
}

// ──────────────────────────────────────────────
// 5. Stornierung → Kunde
// ──────────────────────────────────────────────

function renderBookingCancelled(ctx: BookingEmailContext): RenderedTemplate {
  const subject = `Stornierung Ihrer Anfrage ${ctx.referenceCode}`;

  // ── Plain text ──
  const reasonBlock = ctx.reason
    ? [``, `Grund: ${ctx.reason}`]
    : [];
  const textParts = [
    `Hallo ${ctx.customerFirstName},`,
    ``,
    `Ihre Anfrage (${ctx.referenceCode}) wurde storniert.`,
    ...reasonBlock,
    ``,
    `Zeitraum: ${textDateRange(ctx)}`,
    ``,
    `Falls Sie Fragen haben, kontaktieren Sie uns gerne.`,
    ``,
    `Mit freundlichen Grüßen,`,
    `Ihr GMF-Team`,
  ];

  // ── HTML ──
  let body = `
    <p style="margin:0 0 4px 0;font-size:15px;color:#1f2937;">Hallo <strong>${esc(ctx.customerFirstName)}</strong>,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#1f2937;">Ihre Anfrage wurde storniert.</p>
  `;

  body += highlightBox(`
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Referenz-Nr.</p>
          <p style="margin:4px 0 0 0;font-size:20px;font-weight:700;color:#1f2937;">${esc(ctx.referenceCode)}</p>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          ${statusBadge("cancelled")}
        </td>
      </tr>
    </table>
  `);

  if (ctx.reason) {
    body += reasonBox(ctx.reason, "#d97706");
  }

  body += sectionHeading("Stornierte Buchung");
  body += bookingSummaryBlock(ctx);

  if (ctx.items?.length) {
    body += sectionHeading("Betroffene Produkte");
    body += itemsTable(ctx.items);
  }

  body += `<p style="margin:24px 0 0 0;font-size:15px;color:#1f2937;">Falls Sie Fragen haben, kontaktieren Sie uns gerne.</p>`;
  body += `<p style="margin:16px 0 0 0;font-size:15px;color:#1f2937;">Mit freundlichen Grüßen,<br><strong>Ihr GMF-Team</strong></p>`;

  return {
    subject,
    text: textParts.join("\n"),
    html: htmlLayout(subject, body),
  };
}

// ──────────────────────────────────────────────
// 6. Allgemeine Statusänderung → Kunde
// ──────────────────────────────────────────────

function renderStatusChanged(ctx: BookingEmailContext): RenderedTemplate {
  const subject = `Statusänderung zu Ihrer Anfrage ${ctx.referenceCode}`;

  // ── Plain text ──
  const textParts = [
    `Hallo ${ctx.customerFirstName},`,
    ``,
    `der Status Ihrer Anfrage (${ctx.referenceCode}) hat sich geändert.`,
    ctx.newStatus ? `Neuer Status: ${ctx.newStatus}` : ``,
    ``,
    `Zeitraum: ${textDateRange(ctx)}`,
    ``,
    `Bei Fragen stehen wir Ihnen gerne zur Verfügung.`,
    ``,
    `Mit freundlichen Grüßen,`,
    `Ihr GMF-Team`,
  ];

  // ── HTML ──
  let body = `
    <p style="margin:0 0 4px 0;font-size:15px;color:#1f2937;">Hallo <strong>${esc(ctx.customerFirstName)}</strong>,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#1f2937;">der Status Ihrer Anfrage hat sich geändert.</p>
  `;

  body += highlightBox(`
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Referenz-Nr.</p>
          <p style="margin:4px 0 0 0;font-size:20px;font-weight:700;color:#1f2937;">${esc(ctx.referenceCode)}</p>
        </td>
        ${ctx.newStatus ? `<td style="text-align:right;vertical-align:middle;">${statusBadge(ctx.newStatus)}</td>` : ""}
      </tr>
    </table>
  `);

  body += sectionHeading("Buchungsdetails");
  body += bookingSummaryBlock(ctx, true);

  if (ctx.items?.length) {
    body += sectionHeading("Produkte");
    body += itemsTable(ctx.items);
  }

  body += `<p style="margin:24px 0 0 0;font-size:15px;color:#1f2937;">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>`;
  body += `<p style="margin:16px 0 0 0;font-size:15px;color:#1f2937;">Mit freundlichen Grüßen,<br><strong>Ihr GMF-Team</strong></p>`;

  return {
    subject,
    text: textParts.join("\n"),
    html: htmlLayout(subject, body),
  };
}
