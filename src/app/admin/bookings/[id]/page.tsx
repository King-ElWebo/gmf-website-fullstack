import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, CalendarDays, Mail, MapPin, MessageSquare, Phone, ReceiptText, User } from "lucide-react";
import { PrismaBookingRepository } from "@/lib/booking-core/infrastructure/database/PrismaBookingRepository";
import { getBookingDurationDays } from "@/lib/inquiry-cart/pricing";
import { formatPriceCents, getItemPriceDisplay } from "@/lib/items/price";
import { BookingStatusBadge } from "../../_components/BookingStatusBadge";
import { ClientBookingActions } from "../../_components/ClientBookingActions";
import { NotesSection } from "../../_components/NotesSection";

export const dynamic = "force-dynamic";

type AddressLike = {
  nameOrCompany?: string | null;
  addressLine1?: string | null;
  zip?: string | null;
  city?: string | null;
  country?: string | null;
};

type BookingDetailItem = {
  id: string;
  itemId?: string | null;
  resourceId?: string | null;
  resourceTitle?: string | null;
  quantity: number;
  priceType?: "FIXED" | "FROM_PRICE" | "ON_REQUEST" | string | null;
  basePriceCents?: number | null;
  priceLabel?: string | null;
  displayPrice?: string | null;
  pricingMode?: string | null;
  pricingReason?: string | null;
  bookingDays?: number | null;
  calculatedUnitPriceCents?: number | null;
  calculatedTotalPriceCents?: number | null;
  item?: {
    title?: string | null;
    description?: string | null;
    shortDescription?: string | null;
    category?: {
      name?: string | null;
    } | null;
    images?: Array<{
      url: string;
      alt?: string | null;
    }>;
    priceType?: "FIXED" | "FROM_PRICE" | "ON_REQUEST" | string | null;
    basePriceCents?: number | null;
    priceLabel?: string | null;
    deliveryInfo?: string | null;
    usageInfo?: string | null;
    rentalNotes?: string | null;
    setupRequirements?: string | null;
    accessRequirements?: string | null;
    depositInfo?: string | null;
    cleaningFeeInfo?: string | null;
    dryingFeeInfo?: string | null;
    additionalCostsInfo?: string | null;
  } | null;
};

type BookingDetailNote = {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date | string;
};

type BookingDetailRecord = {
  id: string;
  referenceCode: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  deliveryType: string;
  customerMessage?: string | null;
  billingAddressSameAsDelivery?: boolean | null;
  billingAddress?: AddressLike | null;
  totalPriceCents?: number | null;
  hasIndividualPricing?: boolean | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    addressLine1?: string | null;
    zip?: string | null;
    city?: string | null;
  };
  items: BookingDetailItem[];
  notes?: BookingDetailNote[];
  calendarSync?: {
    syncStatus?: string | null;
    lastSyncedAt?: Date | string | null;
    syncError?: string | null;
  } | null;
};

const pricingReasonLabels: Record<string, string> = {
  missing_date_range: "Zeitraum fehlt",
  invalid_date_range: "Zeitraum ungueltig",
  duration_over_limit: "Dauer erfordert individuelle Kalkulation",
  on_request_price: "Preis auf Anfrage",
  from_price: "Ab-Preis muss geprueft werden",
  missing_base_price: "Basispreis fehlt",
  invalid_quantity: "Menge ungueltig",
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function dateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

function getAddressLines(address: AddressLike | null | undefined) {
  if (!address) return [];
  const cityLine = [address.zip, address.city].filter(Boolean).join(" ");
  return [address.nameOrCompany, address.addressLine1, cityLine, address.country].filter(
    (line): line is string => Boolean(line)
  );
}

function getDeliveryAddress(booking: BookingDetailRecord) {
  return getAddressLines({
    addressLine1: booking.customer.addressLine1,
    zip: booking.customer.zip,
    city: booking.customer.city,
  });
}

function getItemTitle(item: BookingDetailItem) {
  return item.resourceTitle || item.item?.title || item.itemId || "Produkt";
}

function getItemImage(item: BookingDetailItem) {
  return item.item?.images?.[0] ?? null;
}

function getPriceType(item: BookingDetailItem) {
  return item.priceType || item.item?.priceType || "ON_REQUEST";
}

function getBasePriceDisplay(item: BookingDetailItem) {
  const priceType = getPriceType(item);
  const basePriceCents = item.basePriceCents ?? item.item?.basePriceCents ?? null;
  const priceLabel = item.priceLabel ?? item.item?.priceLabel ?? null;

  return getItemPriceDisplay({
    priceType: priceType === "FIXED" || priceType === "FROM_PRICE" || priceType === "ON_REQUEST" ? priceType : "ON_REQUEST",
    basePriceCents,
    priceLabel,
  });
}

function getCalculatedPriceDisplay(item: BookingDetailItem) {
  if (item.pricingMode === "auto" && typeof item.calculatedTotalPriceCents === "number") {
    return formatPriceCents(item.calculatedTotalPriceCents);
  }

  return "Preis auf Anfrage";
}

function getPriceSummary(booking: BookingDetailRecord) {
  if (booking.hasIndividualPricing) {
    if (typeof booking.totalPriceCents === "number" && booking.totalPriceCents > 0) {
      return `${formatPriceCents(booking.totalPriceCents)} + individuelle Positionen`;
    }

    return "Individuell zu kalkulieren";
  }

  return typeof booking.totalPriceCents === "number" ? formatPriceCents(booking.totalPriceCents) : "Nicht berechnet";
}

function getBookingDays(booking: BookingDetailRecord) {
  const duration = getBookingDurationDays(dateKey(booking.startDate), dateKey(booking.endDate));
  return duration.days;
}

function DetailField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium leading-relaxed text-neutral-900">{children}</div>
    </div>
  );
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const repo = new PrismaBookingRepository();
  const booking = (await repo.findById(resolvedParams.id)) as BookingDetailRecord | null;

  if (!booking) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-950">Anfrage nicht gefunden</h1>
        <Link href="/admin/bookings" className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900">
          Zurueck zur Anfragenliste
        </Link>
      </div>
    );
  }

  const bookingDays = getBookingDays(booking);
  const deliveryAddress = getDeliveryAddress(booking);
  const billingAddress = getAddressLines(booking.billingAddress);
  const itemCount = booking.items.length;
  const quantityCount = booking.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/admin/bookings"
              className="mb-3 inline-flex text-xs font-semibold uppercase tracking-wide text-neutral-500 transition hover:text-neutral-950"
            >
              Zurueck zur Liste
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">{booking.referenceCode}</h1>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Erstellt am {formatDateTime(booking.createdAt)} - zuletzt aktualisiert am {formatDateTime(booking.updatedAt)}
            </p>
          </div>

          <ClientBookingActions bookingId={booking.id} currentStatus={booking.status} />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <DetailField icon={<CalendarDays className="h-4 w-4" />} label="Zeitraum">
            {formatDate(booking.startDate)} bis {formatDate(booking.endDate)}
          </DetailField>
          <DetailField icon={<ReceiptText className="h-4 w-4" />} label="Buchungstage">
            {bookingDays == null ? "Nicht berechenbar" : `${bookingDays} ${bookingDays === 1 ? "Tag" : "Tage"}`}
          </DetailField>
          <DetailField icon={<ReceiptText className="h-4 w-4" />} label="Preis">
            {getPriceSummary(booking)}
          </DetailField>
          <DetailField icon={<ReceiptText className="h-4 w-4" />} label="Produkte">
            {itemCount} Positionen / {quantityCount} Stk.
          </DetailField>
        </div>
      </div>

      {booking.hasIndividualPricing ? (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Diese Anfrage enthaelt individuelle Preise.</p>
            <p className="mt-1 text-amber-800">
              Mindestens eine Position muss manuell geprueft oder kalkuliert werden, bevor ein vollstaendiger Gesamtpreis feststeht.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 px-6 py-4">
              <h2 className="text-base font-semibold text-neutral-950">Kundendaten</h2>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <DetailField icon={<User className="h-4 w-4" />} label="Name">
                {booking.customer.firstName} {booking.customer.lastName}
              </DetailField>
              <DetailField icon={<Mail className="h-4 w-4" />} label="E-Mail">
                <a href={`mailto:${booking.customer.email}`} className="text-blue-700 hover:text-blue-900">
                  {booking.customer.email}
                </a>
              </DetailField>
              <DetailField icon={<Phone className="h-4 w-4" />} label="Telefon">
                {booking.customer.phone ? (
                  <a href={`tel:${booking.customer.phone}`} className="text-blue-700 hover:text-blue-900">
                    {booking.customer.phone}
                  </a>
                ) : (
                  "Nicht angegeben"
                )}
              </DetailField>
              <DetailField icon={<MessageSquare className="h-4 w-4" />} label="Nachricht / Sonderwuensche">
                {booking.customerMessage ? (
                  <span className="whitespace-pre-line">{booking.customerMessage}</span>
                ) : (
                  "Keine Nachricht hinterlegt"
                )}
              </DetailField>
              <DetailField icon={<MapPin className="h-4 w-4" />} label="Lieferadresse">
                {deliveryAddress.length > 0 ? (
                  <span className="whitespace-pre-line">{deliveryAddress.join("\n")}</span>
                ) : (
                  "Nicht angegeben"
                )}
              </DetailField>
              <DetailField icon={<ReceiptText className="h-4 w-4" />} label="Rechnungsadresse">
                {booking.billingAddressSameAsDelivery !== false ? (
                  "Entspricht der Lieferadresse"
                ) : billingAddress.length > 0 ? (
                  <span className="whitespace-pre-line">{billingAddress.join("\n")}</span>
                ) : (
                  "Abweichend markiert, aber keine Adresse gespeichert"
                )}
              </DetailField>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-neutral-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-950">Angefragte Produkte</h2>
                <p className="mt-1 text-sm text-neutral-500">Alle Positionen aus dem Anfragekorb mit Preis-Snapshot.</p>
              </div>
              <p className="text-sm font-semibold text-neutral-900">{getPriceSummary(booking)}</p>
            </div>

            <div className="divide-y divide-neutral-100">
              {booking.items.map((item) => {
                const image = getItemImage(item);
                const relevantInfos = [
                  item.item?.deliveryInfo,
                  item.item?.usageInfo,
                  item.item?.rentalNotes,
                  item.item?.setupRequirements,
                  item.item?.accessRequirements,
                  item.item?.depositInfo,
                  item.item?.cleaningFeeInfo,
                  item.item?.dryingFeeInfo,
                  item.item?.additionalCostsInfo,
                ].filter((info): info is string => Boolean(info?.trim()));

                return (
                  <article key={item.id} className="grid gap-5 p-6 md:grid-cols-[112px_minmax(0,1fr)_220px]">
                    <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.alt || getItemTitle(item)}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">Kein Bild</div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start gap-2">
                        <h3 className="text-lg font-semibold text-neutral-950">{getItemTitle(item)}</h3>
                        {item.item?.category?.name ? (
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                            {item.item.category.name}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">Menge: {item.quantity} Stk.</p>
                      {item.item?.shortDescription || item.item?.description ? (
                        <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                          {item.item.shortDescription || item.item.description}
                        </p>
                      ) : null}

                      {relevantInfos.length > 0 ? (
                        <div className="mt-4 rounded-xl bg-neutral-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Zusatzinfos</p>
                          <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                            {relevantInfos.slice(0, 4).map((info, index) => (
                              <li key={`${item.id}-info-${index}`}>{info}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">priceType</p>
                          <p className="mt-1 font-semibold text-neutral-950">{getPriceType(item)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Basispreis</p>
                          <p className="mt-1 font-semibold text-neutral-950">{getBasePriceDisplay(item)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Berechneter Preis</p>
                          <p className="mt-1 font-semibold text-neutral-950">{getCalculatedPriceDisplay(item)}</p>
                          {item.pricingReason ? (
                            <p className="mt-1 text-xs text-amber-700">
                              {pricingReasonLabels[item.pricingReason] || item.pricingReason}
                            </p>
                          ) : null}
                        </div>
                        {typeof item.bookingDays === "number" ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Preis-Tage</p>
                            <p className="mt-1 font-semibold text-neutral-950">{item.bookingDays}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <NotesSection bookingId={booking.id} initialNotes={booking.notes || []} />
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-950">Meta</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-3">
                <span className="text-neutral-500">Lieferart</span>
                <span className="font-medium text-neutral-900">{booking.deliveryType}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-3">
                <span className="text-neutral-500">Calendar Sync</span>
                <span className="font-medium text-neutral-900">{booking.calendarSync?.syncStatus || "Nicht aktiv"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Interne Notizen</span>
                <span className="font-medium text-neutral-900">{booking.notes?.length || 0}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
