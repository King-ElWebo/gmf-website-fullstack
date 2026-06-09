import Link from "next/link";
import { COMPANY_CONFIG } from "@/lib/company-config";
import { notFound } from "next/navigation";
import { PrismaBookingRepository } from "@/lib/booking-core/infrastructure/database/PrismaBookingRepository";
import { formatPriceCents, getItemPriceDisplay } from "@/lib/items/price";
import { getBookingDurationDays } from "@/lib/inquiry-cart/pricing";
import { PrintButton } from "./PrintButton";
import "./print.css";

export const dynamic = "force-dynamic";

type AddressLike = {
    nameOrCompany?: string | null;
    addressLine1?: string | null;
    zip?: string | null;
    city?: string | null;
    country?: string | null;
};

function formatDate(value: Date | string) {
    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function dateKey(value: Date | string) {
    return new Date(value).toISOString().slice(0, 10);
}

function getAddressLines(address: AddressLike | null | undefined) {
    if (!address) return [];
    const cityLine = [address.zip, address.city].filter(Boolean).join(" ");
    return [address.nameOrCompany, address.addressLine1, cityLine, address.country].filter(
        (l): l is string => Boolean(l)
    );
}

function getItemTitle(item: { resourceTitle?: string | null; item?: { title?: string | null } | null; itemId?: string | null }) {
    return item.resourceTitle || item.item?.title || item.itemId || "Produkt";
}

function getPriceType(item: { priceType?: string | null; item?: { priceType?: string | null } | null }) {
    return item.priceType || item.item?.priceType || "ON_REQUEST";
}

function getItemPriceLabel(item: {
    priceType?: string | null;
    basePriceCents?: number | null;
    priceLabel?: string | null;
    pricingMode?: string | null;
    calculatedTotalPriceCents?: number | null;
    item?: {
        priceType?: string | null;
        basePriceCents?: number | null;
        priceLabel?: string | null;
    } | null;
    quantity: number;
    bookingDays?: number | null;
}) {
    if (item.pricingMode === "auto" && typeof item.calculatedTotalPriceCents === "number") {
        return formatPriceCents(item.calculatedTotalPriceCents);
    }
    const priceType = getPriceType(item);
    const basePriceCents = item.basePriceCents ?? item.item?.basePriceCents ?? null;
    const priceLabel = item.priceLabel ?? item.item?.priceLabel ?? null;
    const normalized: "FIXED" | "FROM_PRICE" | "ON_REQUEST" =
        priceType === "FIXED" || priceType === "FROM_PRICE" ? priceType : "ON_REQUEST";
    return getItemPriceDisplay({ priceType: normalized, basePriceCents, priceLabel });
}

function getPriceSummary(booking: {
    hasIndividualPricing?: boolean | null;
    totalPriceCents?: number | null;
}) {
    if (booking.hasIndividualPricing) {
        if (typeof booking.totalPriceCents === "number" && booking.totalPriceCents > 0) {
            return `${formatPriceCents(booking.totalPriceCents)} + individuelle Positionen`;
        }
        return "Individuell (auf Anfrage)";
    }
    return typeof booking.totalPriceCents === "number"
        ? formatPriceCents(booking.totalPriceCents)
        : "Auf Anfrage";
}

export default async function MietvertragPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const repo = new PrismaBookingRepository();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const booking = (await repo.findById(id)) as any;

    if (!booking) notFound();

    // ── Status gate: rejected/cancelled → info page ──
    if (booking.status === "rejected" || booking.status === "cancelled") {
        return (
            <>
                <div className="no-print screen-controls">
                    <Link href={`/admin/bookings/${id}`} className="back-link">
                        ← Zurück zur Buchungsdetails
                    </Link>
                </div>
                <div className="mietvertrag-doc" style={{ textAlign: "center", paddingTop: "80px", paddingBottom: "80px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "24px" }}>📋</div>
                    <div style={{ fontSize: "18pt", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
                        Kein finaler Vertrag verfügbar
                    </div>
                    <div style={{ fontSize: "11pt", color: "#64748b", maxWidth: "420px", margin: "0 auto", lineHeight: 1.6 }}>
                        Diese Anfrage wurde {booking.status === "rejected" ? "abgelehnt" : "storniert"}.
                        Ein Mietvertrag / Lieferschein wird nur für bestätigte Buchungen erstellt.
                    </div>
                    <div style={{ marginTop: "32px" }}>
                        <Link
                            href={`/admin/bookings/${id}`}
                            style={{ color: "#1e40af", fontWeight: 600, fontSize: "11pt", textDecoration: "none" }}
                        >
                            → Zurück zur Buchungsdetails
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const isDraft = booking.status !== "approved";

    const deliveryAddress = getAddressLines({
        addressLine1: booking.customer.addressLine1,
        zip: booking.customer.zip,
        city: booking.customer.city,
    });
    const billingAddress = getAddressLines(booking.billingAddress);
    const showBillingAddress = booking.billingAddressSameAsDelivery === false && billingAddress.length > 0;

    const duration = getBookingDurationDays(dateKey(booking.startDate), dateKey(booking.endDate));
    const bookingDays = duration.days;

    const today = new Intl.DateTimeFormat("de-DE").format(new Date());

    return (
        <>
            {/* ── Screen-only controls ── */}
            <div className="no-print screen-controls">
                <Link href={`/admin/bookings/${id}`} className="back-link">
                    ← Zurück zur Buchungsdetails
                </Link>
                <PrintButton />
            </div>

            {/* ── The printable document ── */}
            <div className="mietvertrag-doc" id="mietvertrag">
                {/* Header */}
                {isDraft && (
                    <div className="draft-banner">
                        ⚠️ ENTWURF – Dieser Vertrag ist noch nicht bestätigt und daher nicht gültig.
                    </div>
                )}

                <header className="doc-header">
                    <div className="doc-header-left">
                        <div className="company-name">{COMPANY_CONFIG.brandingName}</div>
                        <div className="company-detail">{COMPANY_CONFIG.legalName} · {COMPANY_CONFIG.activities}</div>
                        <div className="company-detail">{COMPANY_CONFIG.address}</div>
                        <div className="company-detail">Tel: {COMPANY_CONFIG.phone} | {COMPANY_CONFIG.emailPrimary} | {COMPANY_CONFIG.emailSecondary}</div>
                        <div className="company-detail">UID: {COMPANY_CONFIG.uid}</div>
                    </div>
                    <div className="doc-header-right">
                        <div className="doc-title">Mietvertrag & Lieferschein</div>
                        <div className="doc-refcode">Ref: {booking.referenceCode}</div>
                        <div className="doc-date">Erstellt am: {today}</div>
                        <div className={`doc-status status-${booking.status}`}>
                            {booking.status === "approved" ? "✓ Bestätigt" : booking.status.toUpperCase()}
                        </div>
                    </div>
                </header>

                <hr className="doc-divider" />

                {/* Customer + Addresses */}
                <section className="section-grid-2">
                    <div className="info-block">
                        <div className="info-block-title">Kundendaten</div>
                        <div className="info-block-content">
                            <strong>
                                {booking.customer.firstName} {booking.customer.lastName}
                            </strong>
                            {booking.customer.phone && (
                                <div>Tel: {booking.customer.phone}</div>
                            )}
                            <div>{booking.customer.email}</div>
                        </div>
                    </div>

                    <div className="info-block">
                        <div className="info-block-title">Liefer-/Abholadresse</div>
                        <div className="info-block-content">
                            {deliveryAddress.length > 0 ? (
                                deliveryAddress.map((line, i) => <div key={i}>{line}</div>)
                            ) : (
                                <span className="text-muted">Selbstabholung / nicht angegeben</span>
                            )}
                            <div className="mt-small">
                                <em>Lieferart: {booking.deliveryType === "delivery" ? "Lieferung" : booking.deliveryType === "pickup" ? "Selbstabholung" : booking.deliveryType}</em>
                            </div>
                        </div>
                    </div>

                    {showBillingAddress && (
                        <div className="info-block">
                            <div className="info-block-title">Rechnungsadresse (abweichend)</div>
                            <div className="info-block-content">
                                {billingAddress.map((line, i) => <div key={i}>{line}</div>)}
                            </div>
                        </div>
                    )}

                    <div className="info-block">
                        <div className="info-block-title">Mietzeitraum</div>
                        <div className="info-block-content">
                            <div>
                                <strong>Von:</strong> {formatDate(booking.startDate)}
                            </div>
                            <div>
                                <strong>Bis:</strong> {formatDate(booking.endDate)}
                            </div>
                            {bookingDays != null && (
                                <div>
                                    <strong>Dauer:</strong> {bookingDays} {bookingDays === 1 ? "Tag" : "Tage"}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <hr className="doc-divider" />

                {/* Items table */}
                <section>
                    <div className="section-title">Gemietete Artikel / Positionen</div>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th className="col-pos">#</th>
                                <th className="col-desc">Beschreibung</th>
                                <th className="col-qty">Menge</th>
                                <th className="col-unit">Einzelpreis</th>
                                <th className="col-total">Gesamtpreis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {booking.items.map((item: {
                                id: string;
                                resourceTitle?: string | null;
                                quantity: number;
                                priceType?: string | null;
                                basePriceCents?: number | null;
                                priceLabel?: string | null;
                                pricingMode?: string | null;
                                calculatedTotalPriceCents?: number | null;
                                calculatedUnitPriceCents?: number | null;
                                bookingDays?: number | null;
                                item?: {
                                    title?: string | null;
                                    shortDescription?: string | null;
                                    category?: { name?: string | null } | null;
                                    priceType?: string | null;
                                    basePriceCents?: number | null;
                                    priceLabel?: string | null;
                                } | null;
                            }, index: number) => {
                                const unitPriceLabel =
                                    item.pricingMode === "auto" && typeof item.calculatedUnitPriceCents === "number"
                                        ? formatPriceCents(item.calculatedUnitPriceCents)
                                        : getItemPriceLabel(item);
                                const totalPriceLabel = getItemPriceLabel(item);

                                return (
                                    <tr key={item.id}>
                                        <td className="col-pos">{index + 1}</td>
                                        <td className="col-desc">
                                            <div className="item-title">{getItemTitle(item)}</div>
                                            {item.item?.category?.name && (
                                                <div className="item-category">{item.item.category.name}</div>
                                            )}
                                            {item.item?.shortDescription && (
                                                <div className="item-desc">{item.item.shortDescription}</div>
                                            )}
                                            {bookingDays != null && item.bookingDays != null && (
                                                <div className="item-days">{item.bookingDays} Preistage</div>
                                            )}
                                        </td>
                                        <td className="col-qty">{item.quantity} Stk.</td>
                                        <td className="col-unit">{unitPriceLabel}</td>
                                        <td className="col-total">{totalPriceLabel}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="total-row">
                                <td colSpan={4} className="total-label">
                                    Gesamtbetrag
                                </td>
                                <td className="total-value">{getPriceSummary(booking)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="price-hints">
                        <div>• Alle Preise inkl. gesetzlicher MwSt.</div>
                        <div>• Anfahrt/Lieferung wird zusätzlich nach Entfernung und Absprache verrechnet.</div>
                        {booking.hasIndividualPricing && (
                            <div>• Positionen mit „Preis auf Anfrage" werden individuell kalkuliert und separat kommuniziert.</div>
                        )}
                    </div>
                </section>

                <hr className="doc-divider" />

                {/* Customer message */}
                {booking.customerMessage && (
                    <>
                        <section>
                            <div className="section-title">Sonderwünsche / Hinweise des Kunden</div>
                            <div className="customer-message">{booking.customerMessage}</div>
                        </section>
                        <hr className="doc-divider" />
                    </>
                )}

                {/* Payment */}
                <section className="section-grid-2">
                    <div className="info-block">
                        <div className="info-block-title">Zahlungsart</div>
                        <div className="info-block-content payment-options">
                            <label className="payment-option">
                                <span className="checkbox-box" />
                                <span>Barzahlung</span>
                            </label>
                            <label className="payment-option">
                                <span className="checkbox-box" />
                                <span>Banküberweisung</span>
                            </label>
                        </div>
                    </div>

                    <div className="info-block">
                        <div className="info-block-title">Zahlungsstatus</div>
                        <div className="info-block-content payment-status-grid">
                            <div className="payment-status-row">
                                <span>Bezahlt am:</span>
                                <span className="fill-line" />
                            </div>
                            <div className="payment-status-row">
                                <span>Betrag erhalten:</span>
                                <span className="fill-line" />
                                <span>€</span>
                            </div>
                            <div className="payment-status-row">
                                <span>Offene Zahlung:</span>
                                <span className="fill-line" />
                                <span>€</span>
                            </div>
                            <div className="payment-status-row" style={{ marginTop: "4px" }}>
                                <label className="payment-option">
                                    <span className="checkbox-box" />
                                    <span>Vollständig bezahlt</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bankverbindung & QR Code */}
                <div className="info-block" style={{ marginTop: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div className="info-block-title">Bankverbindung & Zahlung</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: "16px", alignItems: "center" }}>
                        <div className="info-block-content" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px", fontSize: "9.5pt" }}>
                            <div><strong>Kontoinhaber:</strong> {COMPANY_CONFIG.bank.holder}</div>
                            <div><strong>IBAN:</strong> {COMPANY_CONFIG.bank.iban}</div>
                            <div><strong>BIC:</strong> {COMPANY_CONFIG.bank.bic}</div>
                            <div style={{ fontSize: "8.5pt", color: "#64748b", marginTop: "4px" }}>
                                * Bitte geben Sie als Verwendungszweck Ihre Referenznummer <strong>{booking.referenceCode}</strong> an.
                            </div>
                        </div>
                        {/* QR-Code Placeholder */}
                        <div style={{
                            border: "1.5px dashed #cbd5e1",
                            borderRadius: "8px",
                            height: "100px",
                            width: "100px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            background: "#fff",
                            padding: "4px",
                            fontSize: "7.5pt",
                            color: "#94a3b8",
                            marginLeft: "auto"
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "4px", color: "#cbd5e1" }}>
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            <span style={{ fontWeight: "600" }}>QR-Zahlung</span>
                            <span style={{ fontSize: "6.5pt" }}>[Vorbereitet]</span>
                        </div>
                    </div>
                </div>

                <hr className="doc-divider" />

                {/* Rental conditions */}
                <section>
                    <div className="section-title">Mietbedingungen</div>
                    <div className="conditions-grid">
                        <div className="condition-item">
                            <strong>Inkludiertes Zubehör:</strong> Bei der Miete ist das komplette Zubehör wie Fallschutzmatten, Gebläse, Erdnägel und Transportwagen inkludiert.
                        </div>
                        <div className="condition-item">
                            <strong>Technische Prüfung:</strong> Die Module sind zivil-technisch überprüft, um etwaige Mängel auszuschließen.
                        </div>
                        <div className="condition-item">
                            <strong>Helfer vor Ort:</strong> Zum Aufstellen werden zusätzlich 1 bis 2 kräftige Helfer benötigt, ebenso beim Abbau.
                        </div>
                        <div className="condition-item">
                            <strong>Stromversorgung:</strong> Die Stromversorgung ist vom Veranstalter bereitzustellen. Pro Hüpfburg werden ca. 3 kW Strom benötigt.
                        </div>
                        <div className="condition-item">
                            <strong>Betreuungspflicht:</strong> Die Hüpfburg muss während der gesamten Nutzung durch einen Erwachsenen betreut bzw. beaufsichtigt werden.
                        </div>
                        <div className="condition-item">
                            <strong>Haftungsausschluss:</strong> Der Vermieter haftet nicht für Unfälle oder Schäden, die durch Missbrauch oder Versäumnisse des Veranstalters entstehen.
                        </div>
                        <div className="condition-item">
                            <strong>Untergrund:</strong> Der Untergrund soll eben und frei von Verschmutzungen sein.
                        </div>
                        <div className="condition-item">
                            <strong>Veranstaltungsmeldung:</strong> Veranstaltungsmeldung übernimmt der Veranstalter.
                        </div>
                        <div className="condition-item">
                            <strong>Reinigungspauschale:</strong> Bei grober oder mutwilliger Verschmutzung fällt eine Reinigungspauschale von 120 € exkl. MwSt. pro Hüpfburg an.
                        </div>
                        <div className="condition-item">
                            <strong>Trocknungskosten:</strong> Sollte eine Hüpfburg durch Regen komplett nass sein, wird für die Trocknung pro Hüpfburg eine Pauschale von 165 € netto verrechnet.
                        </div>
                        <div className="condition-item">
                            <strong>Beschädigungen:</strong> Etwaige Beschädigungen wie Risse, Stiche usw. werden nach entstandenem Aufwand und Reparatur abgerechnet.
                        </div>
                        <div className="condition-item">
                            <strong>Stornobedingungen:</strong> Bis 2 Tage vor Veranstaltung kostenlos. Danach werden die angefallenen Kosten bis maximal 350 € netto verrechnet.
                        </div>
                    </div>
                </section>

                <hr className="doc-divider" />

                {/* Signatures */}
                <section className="signature-section">
                    <div className="section-title">Übergabe & Unterschriften</div>
                    <div className="signature-grid">
                        <div className="signature-block">
                            <div className="signature-label">Ort, Datum</div>
                            <div className="signature-line" />
                            <div className="signature-hint">{today}</div>
                        </div>
                        <div className="signature-block" style={{ position: "relative" }}>
                            <div className="signature-label">Unterschrift Kunde / Mieterin</div>
                            <div className="signature-line" />
                            <div className="signature-hint">
                                {booking.customer.firstName} {booking.customer.lastName}
                            </div>
                            {/* Digital Signature Placeholder */}
                            <div className="no-print" style={{
                                position: "absolute",
                                bottom: "35px",
                                right: "0",
                                border: "1px dashed #cbd5e1",
                                borderRadius: "4px",
                                padding: "2px 6px",
                                fontSize: "7pt",
                                color: "#94a3b8",
                                background: "#fff",
                                userSelect: "none"
                            }}>
                                [ Digitale Signatur vorbereitet ]
                            </div>
                        </div>
                        <div className="signature-block">
                            <div className="signature-label">Unterschrift Vermieter / Übergabe</div>
                            <div className="signature-line" />
                            <div className="signature-hint">{COMPANY_CONFIG.legalName}</div>
                        </div>
                    </div>

                    <div className="handover-checklist">
                        <div className="section-title" style={{ marginBottom: "8px" }}>Übergabeprotokoll</div>
                        <div className="checklist-grid">
                            <label className="checklist-item">
                                <span className="checkbox-box" />
                                <span>Alle Artikel vollständig übergeben</span>
                            </label>
                            <label className="checklist-item">
                                <span className="checkbox-box" />
                                <span>Zustand geprüft und akzeptiert</span>
                            </label>
                            <label className="checklist-item">
                                <span className="checkbox-box" />
                                <span>Kaution erhalten</span>
                            </label>
                            <label className="checklist-item">
                                <span className="checkbox-box" />
                                <span>Bedingungen erläutert und akzeptiert</span>
                            </label>
                        </div>
                        <div className="kaution-row">
                            <span>Kautionsbetrag:</span>
                            <span className="fill-line" />
                            <span>€</span>
                        </div>
                    </div>
                </section>

                <footer className="doc-footer">
                    {COMPANY_CONFIG.brandingName} · {COMPANY_CONFIG.address} · {COMPANY_CONFIG.emailPrimary} · Ref: {booking.referenceCode}
                </footer>
            </div>
        </>
    );
}
