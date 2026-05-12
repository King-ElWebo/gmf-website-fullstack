import Link from "next/link";
import { notFound } from "next/navigation";
import { PrismaBookingRepository } from "@/lib/booking-core/infrastructure/database/PrismaBookingRepository";
import { formatPriceCents, getItemPriceDisplay } from "@/lib/items/price";
import { getBookingDurationDays } from "@/lib/inquiry-cart/pricing";
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
                <button onClick={() => window.print()} className="print-btn">
                    🖨️ Mietvertrag drucken
                </button>
            </div>

            {/* ── The printable document ── */}
            <div className="mietvertrag-doc" id="mietvertrag">
                {/* Header */}
                <header className="doc-header">
                    <div className="doc-header-left">
                        <div className="company-name">GMF Eventmodule</div>
                        <div className="company-detail">Georg Müller | 3702 Stranzendorf</div>
                        <div className="company-detail">Tel: +43 123 456789 | office@gmf-eventmodule.at</div>
                    </div>
                    <div className="doc-header-right">
                        <div className="doc-title">Mietvertrag / Lieferschein</div>
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
                        <div>• Anfahrt / Lieferung wird zusätzlich nach Entfernung und Absprache berechnet.</div>
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
                            </div>
                            <div className="payment-status-row">
                                <label className="payment-option">
                                    <span className="checkbox-box" />
                                    <span>Vollständig bezahlt</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="doc-divider" />

                {/* Rental conditions */}
                <section>
                    <div className="section-title">Mietbedingungen</div>
                    <div className="conditions-grid">
                        <div className="condition-item">
                            <strong>Rückgabe:</strong> Alle Artikel sind zum vereinbarten Rückgabetermin vollständig und ordentlich verpackt zurückzugeben.
                        </div>
                        <div className="condition-item">
                            <strong>Reinigung:</strong> Stark verschmutzte Artikel werden mit einer Reinigungspauschale von 120 € in Rechnung gestellt.
                        </div>
                        <div className="condition-item">
                            <strong>Trocknung:</strong> Bei Rückgabe nasser Hüpfburgen/Rutschen fällt eine Trocknungspauschale von 190 € an.
                        </div>
                        <div className="condition-item">
                            <strong>Kaution:</strong> Eine Kaution ist bei Übergabe fällig und wird nach ordnungsgemäßer Rückgabe erstattet.
                        </div>
                        <div className="condition-item">
                            <strong>Haftung:</strong> Der Mieter haftet für Beschädigungen oder Verlust der gemieteten Artikel während der Mietdauer.
                        </div>
                        <div className="condition-item">
                            <strong>Stornierung:</strong> Kostenlos bis 48h vorher. Danach 25% (bis 24h), Vor-Ort-Storno 50% zzgl. Anfahrtskosten.
                        </div>
                        <div className="condition-item">
                            <strong>Nutzung:</strong> Die Artikel sind sorgfältig und bestimmungsgemäß zu nutzen. Betreiber/Vermieter stellt keine eigene Versicherung.
                        </div>
                        <div className="condition-item">
                            <strong>Schlechtwetter:</strong> Hüpfburgen dürfen bei Regen/Sturm aus Sicherheitsgründen nicht betrieben werden.
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
                        <div className="signature-block">
                            <div className="signature-label">Unterschrift Kunde / Mieterin</div>
                            <div className="signature-line" />
                            <div className="signature-hint">
                                {booking.customer.firstName} {booking.customer.lastName}
                            </div>
                        </div>
                        <div className="signature-block">
                            <div className="signature-label">Unterschrift Vermieter / Übergabe</div>
                            <div className="signature-line" />
                            <div className="signature-hint">GMF Eventmodule</div>
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
                    GMF Eventmodule · 3702 Stranzendorf · office@gmf-eventmodule.at · Ref: {booking.referenceCode}
                </footer>
            </div>
        </>
    );
}
