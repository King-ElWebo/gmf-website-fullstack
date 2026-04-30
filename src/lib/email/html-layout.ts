/**
 * Central HTML email layout and utility functions.
 *
 * All HTML is inline-styled for maximum email-client compatibility.
 * Uses a table-based layout that works in Outlook, Gmail, Apple Mail, etc.
 */

import type { BookingEmailAddress, BookingEmailContext, BookingEmailItem } from "./types";

// ──────────────────────────────────────────────
// Brand / Config
// ──────────────────────────────────────────────

const BRAND_NAME = process.env.EMAIL_BRAND_NAME || "GMF Events";
const BRAND_COLOR = "#2563eb";       // Primary blue
const BRAND_COLOR_LIGHT = "#eff6ff"; // Light blue tint for backgrounds
const TEXT_COLOR = "#1f2937";
const TEXT_MUTED = "#6b7280";
const BORDER_COLOR = "#e5e7eb";
const SUCCESS_COLOR = "#059669";
const DANGER_COLOR = "#dc2626";
const WARNING_COLOR = "#d97706";

// ──────────────────────────────────────────────
// Escaping
// ──────────────────────────────────────────────

/** HTML-escape user-supplied content to prevent XSS in email clients */
export function esc(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ──────────────────────────────────────────────
// Formatting helpers
// ──────────────────────────────────────────────

/** Format an ISO date string (YYYY-MM-DD) to German locale (TT.MM.JJJJ) */
export function formatDateDE(isoDate: string): string {
  if (!isoDate) return "–";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return isoDate;
}

/** Format cents to Euro string, e.g. 12050 → "120,50 €" */
export function formatCentsEuro(cents: number | null | undefined): string {
  if (cents == null) return "";
  const euros = (cents / 100).toFixed(2).replace(".", ",");
  return `${euros}\u00A0€`;
}

/** Map delivery type keys to German labels */
export function deliveryLabel(type: string): string {
  const map: Record<string, string> = {
    pickup: "Selbstabholung",
    delivery: "Lieferung",
    shipping: "Versand",
    digital: "Digital",
    onsite: "Vor Ort",
  };
  return map[type] || type;
}

/** Map status keys to German labels with optional emoji */
export function statusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    requested: { label: "Angefragt", color: WARNING_COLOR },
    approved: { label: "Bestätigt", color: SUCCESS_COLOR },
    rejected: { label: "Abgelehnt", color: DANGER_COLOR },
    cancelled: { label: "Storniert", color: DANGER_COLOR },
    expired: { label: "Abgelaufen", color: TEXT_MUTED },
    completed: { label: "Abgeschlossen", color: SUCCESS_COLOR },
  };
  return map[status] || { label: status, color: TEXT_MUTED };
}

// ──────────────────────────────────────────────
// Address rendering
// ──────────────────────────────────────────────

export function formatAddress(addr: BookingEmailAddress | undefined | null): string | null {
  if (!addr) return null;
  const lines: string[] = [];
  if (addr.nameOrCompany) lines.push(esc(addr.nameOrCompany));
  if (addr.addressLine1) lines.push(esc(addr.addressLine1));
  const zipCity = [addr.zip, addr.city].filter(Boolean).join(" ");
  if (zipCity) lines.push(esc(zipCity));
  if (addr.country) lines.push(esc(addr.country));
  return lines.length > 0 ? lines.join("<br>") : null;
}

// ──────────────────────────────────────────────
// Reusable HTML blocks
// ──────────────────────────────────────────────

/** Full HTML document wrapper (table-based, centered, max-width 600px) */
export function htmlLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${esc(title)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_COLOR};padding:28px 32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">${esc(BRAND_NAME)}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;color:${TEXT_COLOR};font-size:15px;line-height:1.6;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid ${BORDER_COLOR};text-align:center;font-size:12px;color:${TEXT_MUTED};line-height:1.5;">
              <p style="margin:0;">Diese E-Mail wurde automatisch versendet.</p>
              <p style="margin:4px 0 0 0;">&copy; ${new Date().getFullYear()} ${esc(BRAND_NAME)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Section heading inside the email body */
export function sectionHeading(text: string): string {
  return `<h2 style="margin:24px 0 12px 0;font-size:16px;font-weight:600;color:${TEXT_COLOR};border-bottom:2px solid ${BRAND_COLOR};padding-bottom:6px;">${esc(text)}</h2>`;
}

/** Key-value row (label: value) */
export function infoRow(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:6px 12px 6px 0;font-size:14px;color:${TEXT_MUTED};white-space:nowrap;vertical-align:top;font-weight:500;">${esc(label)}</td>
    <td style="padding:6px 0;font-size:14px;color:${TEXT_COLOR};vertical-align:top;">${value}</td>
  </tr>`;
}

/** Wraps info rows in a table */
export function infoTable(rows: string): string {
  if (!rows.trim()) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">${rows}</table>`;
}

/** Status badge */
export function statusBadge(status: string): string {
  const s = statusLabel(status);
  return `<span style="display:inline-block;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;color:#ffffff;background-color:${s.color};">${esc(s.label)}</span>`;
}

/** Highlighted info box (e.g. for reference code) */
export function highlightBox(content: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
    <tr>
      <td style="background-color:${BRAND_COLOR_LIGHT};border-left:4px solid ${BRAND_COLOR};padding:16px 20px;border-radius:0 8px 8px 0;">
        ${content}
      </td>
    </tr>
  </table>`;
}

/** Alert / reason box (for rejections, cancellations) */
export function reasonBox(reasonText: string, color: string = DANGER_COLOR): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
    <tr>
      <td style="background-color:#fef2f2;border-left:4px solid ${color};padding:16px 20px;border-radius:0 8px 8px 0;font-size:14px;color:${TEXT_COLOR};">
        <strong style="display:block;margin-bottom:4px;color:${color};">Begründung</strong>
        ${esc(reasonText)}
      </td>
    </tr>
  </table>`;
}

/** Customer message box */
export function messageBox(message: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
    <tr>
      <td style="background-color:#f9fafb;border:1px solid ${BORDER_COLOR};padding:16px 20px;border-radius:8px;font-size:14px;color:${TEXT_COLOR};font-style:italic;">
        „${esc(message)}"
      </td>
    </tr>
  </table>`;
}

// ──────────────────────────────────────────────
// Product / Items table
// ──────────────────────────────────────────────

export function itemsTable(items: BookingEmailItem[]): string {
  if (!items || items.length === 0) return "";

  const hasAnyPrice = items.some(
    (i) => i.calculatedTotalPriceCents != null || i.displayPrice
  );

  const headerCols = `
    <th style="padding:10px 12px;text-align:left;font-size:13px;font-weight:600;color:${TEXT_MUTED};border-bottom:2px solid ${BORDER_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Produkt</th>
    <th style="padding:10px 12px;text-align:center;font-size:13px;font-weight:600;color:${TEXT_MUTED};border-bottom:2px solid ${BORDER_COLOR};text-transform:uppercase;letter-spacing:0.5px;width:60px;">Menge</th>
    ${hasAnyPrice ? `<th style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600;color:${TEXT_MUTED};border-bottom:2px solid ${BORDER_COLOR};text-transform:uppercase;letter-spacing:0.5px;width:100px;">Preis</th>` : ""}
  `;

  const rows = items
    .map((item) => {
      let priceCell = "";
      if (hasAnyPrice) {
        let priceDisplay: string;
        if (item.priceType === "ON_REQUEST") {
          priceDisplay = `<span style="color:${TEXT_MUTED};font-style:italic;">Auf Anfrage</span>`;
        } else if (item.calculatedTotalPriceCents != null) {
          priceDisplay = esc(formatCentsEuro(item.calculatedTotalPriceCents));
        } else if (item.displayPrice) {
          priceDisplay = esc(item.displayPrice);
        } else {
          priceDisplay = `<span style="color:${TEXT_MUTED};">–</span>`;
        }
        priceCell = `<td style="padding:10px 12px;text-align:right;font-size:14px;color:${TEXT_COLOR};border-bottom:1px solid ${BORDER_COLOR};">${priceDisplay}</td>`;
      }

      return `<tr>
        <td style="padding:10px 12px;font-size:14px;color:${TEXT_COLOR};border-bottom:1px solid ${BORDER_COLOR};">${esc(item.title)}</td>
        <td style="padding:10px 12px;text-align:center;font-size:14px;color:${TEXT_COLOR};border-bottom:1px solid ${BORDER_COLOR};">${item.quantity}</td>
        ${priceCell}
      </tr>`;
    })
    .join("");

  // Grand total row
  let totalRow = "";
  if (hasAnyPrice) {
    const allOnRequest = items.every((i) => i.priceType === "ON_REQUEST");
    if (!allOnRequest) {
      const totalCents = items.reduce((sum, i) => {
        return sum + (i.calculatedTotalPriceCents ?? 0);
      }, 0);
      const hasPartialPricing = items.some(
        (i) => i.priceType === "ON_REQUEST" || (i.calculatedTotalPriceCents == null && i.priceType !== "ON_REQUEST")
      );
      const totalLabel = hasPartialPricing ? "Zwischensumme*" : "Gesamt";
      const totalNote = hasPartialPricing
        ? `<tr><td colspan="3" style="padding:6px 12px;font-size:12px;color:${TEXT_MUTED};font-style:italic;">* Einige Positionen werden individuell kalkuliert.</td></tr>`
        : "";

      totalRow = `<tr>
        <td colspan="2" style="padding:12px 12px;font-size:14px;font-weight:700;color:${TEXT_COLOR};text-align:right;">${totalLabel}</td>
        <td style="padding:12px 12px;font-size:15px;font-weight:700;color:${TEXT_COLOR};text-align:right;">${esc(formatCentsEuro(totalCents))}</td>
      </tr>${totalNote}`;
    }
  }

  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 16px 0;border-collapse:collapse;">
    <thead><tr>${headerCols}</tr></thead>
    <tbody>${rows}${totalRow}</tbody>
  </table>`;
}

// ──────────────────────────────────────────────
// Customer details block (used in admin emails)
// ──────────────────────────────────────────────

export function customerDetailsBlock(ctx: BookingEmailContext): string {
  const rows: string[] = [];
  rows.push(infoRow("Name", esc(`${ctx.customerFirstName} ${ctx.customerLastName}`)));
  rows.push(infoRow("E-Mail", `<a href="mailto:${esc(ctx.customerEmail)}" style="color:${BRAND_COLOR};text-decoration:none;">${esc(ctx.customerEmail)}</a>`));
  if (ctx.customerPhone) {
    rows.push(infoRow("Telefon", esc(ctx.customerPhone)));
  }
  return infoTable(rows.join(""));
}

// ──────────────────────────────────────────────
// Address details block
// ──────────────────────────────────────────────

export function addressBlock(ctx: BookingEmailContext): string {
  let html = "";

  const deliveryAddr = formatAddress(ctx.customerAddress);
  if (deliveryAddr) {
    html += sectionHeading("Lieferadresse");
    html += `<p style="font-size:14px;line-height:1.6;margin:0 0 8px 0;">${deliveryAddr}</p>`;
  }

  if (ctx.billingAddressSameAsDelivery === false && ctx.billingAddress) {
    const billingAddr = formatAddress(ctx.billingAddress);
    if (billingAddr) {
      html += sectionHeading("Rechnungsadresse");
      html += `<p style="font-size:14px;line-height:1.6;margin:0 0 8px 0;">${billingAddr}</p>`;
    }
  }

  return html;
}

// ──────────────────────────────────────────────
// Booking summary block (shared across templates)
// ──────────────────────────────────────────────

export function bookingSummaryBlock(ctx: BookingEmailContext, showStatus: boolean = false): string {
  const rows: string[] = [];
  rows.push(infoRow("Referenz", `<strong>${esc(ctx.referenceCode)}</strong>`));
  rows.push(infoRow("Zeitraum", `${formatDateDE(ctx.startDate)} – ${formatDateDE(ctx.endDate)}`));
  rows.push(infoRow("Lieferart", esc(deliveryLabel(ctx.deliveryType))));
  if (showStatus && ctx.newStatus) {
    rows.push(infoRow("Status", statusBadge(ctx.newStatus)));
  }
  return infoTable(rows.join(""));
}
