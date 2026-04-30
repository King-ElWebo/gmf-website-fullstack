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
  textParts.push(``, `Bitte im Admin-Dashboard prüfen und bearbeiten.`);

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
