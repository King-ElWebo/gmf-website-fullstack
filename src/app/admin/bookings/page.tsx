import Link from "next/link";
import { Search } from "lucide-react";
import { PrismaBookingRepository } from "@/lib/booking-core/infrastructure/database/PrismaBookingRepository";
import type { BookingStatus } from "@/lib/booking-core/domain/models";
import { formatPriceCents } from "@/lib/items/price";
import { BookingStatusBadge } from "../_components/BookingStatusBadge";

export const dynamic = "force-dynamic";

type AdminBookingsSearchParams = {
  status?: string;
  tab?: string;
  page?: string;
  q?: string;
};

type AdminBookingListItem = {
  id: string;
  referenceCode: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
  totalPriceCents?: number | null;
  hasIndividualPricing?: boolean | null;
  archivedAt?: Date | string | null;
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  items: Array<{
    quantity: number;
    pricingMode?: string | null;
    calculatedTotalPriceCents?: number | null;
    item?: {
      title?: string | null;
      category?: {
        name?: string | null;
      } | null;
    } | null;
  }>;
};

function buildFilterUrl(tab: string | null, status: string | null, query: string | null) {
  const params = new URLSearchParams();
  if (tab && tab !== "active") params.set("tab", tab);
  if (status) params.set("status", status);
  if (query) params.set("q", query);
  const searchStr = params.toString();
  return searchStr ? `/admin/bookings?${searchStr}` : "/admin/bookings";
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("de-DE", {
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

function getCustomerName(booking: AdminBookingListItem) {
  const name = [booking.customer?.firstName, booking.customer?.lastName].filter(Boolean).join(" ");
  return name || "Unbekannter Kunde";
}

function getProductSummary(booking: AdminBookingListItem) {
  const itemCount = booking.items.length;
  const quantityCount = booking.items.reduce((sum, item) => sum + item.quantity, 0);
  const suffix = itemCount === 1 ? "Position" : "Positionen";
  return `${itemCount} ${suffix} / ${quantityCount} Stk.`;
}

function getPriceSummary(booking: AdminBookingListItem) {
  if (booking.hasIndividualPricing) {
    if (typeof booking.totalPriceCents === "number" && booking.totalPriceCents > 0) {
      return `${formatPriceCents(booking.totalPriceCents)} + individuelle Preise`;
    }

    return "Individuelle Preise";
  }

  if (typeof booking.totalPriceCents === "number") {
    return formatPriceCents(booking.totalPriceCents);
  }

  const calculatedTotal = booking.items.reduce((sum, item) => {
    return sum + (typeof item.calculatedTotalPriceCents === "number" ? item.calculatedTotalPriceCents : 0);
  }, 0);

  return calculatedTotal > 0 ? formatPriceCents(calculatedTotal) : "Noch nicht berechnet";
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<AdminBookingsSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const repo = new PrismaBookingRepository();
  
  const tab = resolvedSearchParams.tab || "active";
  const status = resolvedSearchParams.status || null;
  const q = resolvedSearchParams.q?.trim() || null;
  const page = Number.parseInt(resolvedSearchParams.page || "1", 10) || 1;

  const filters = {
    statuses: status ? ([status] as any[]) : undefined,
    keyword: q || undefined,
    tab: tab as any,
  };

  const result = await repo.findForAdminView(filters, page, 50);
  const bookings = result.data as AdminBookingListItem[];

  const viewTabs = [
    { label: "Aktive Buchungen", value: "active" },
    { label: "Vergangene Buchungen", value: "past" },
    { label: "Archivierte Buchungen", value: "archived" },
    { label: "Alle Buchungen", value: "all" },
  ];

  const statusOptions = [
    { label: "Alle Status", value: null },
    { label: "Offen (requested)", value: "requested" },
    { label: "Bestätigt (approved)", value: "approved" },
    { label: "Abgelehnt (rejected)", value: "rejected" },
    { label: "Storniert (cancelled)", value: "cancelled" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">Anfragen</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Prufe eingegangene Anfragen, Preise, Produkte und Kundendaten auf einen Blick.
          </p>
        </div>

        <form action="/admin/bookings" className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          {tab && tab !== "active" ? (
            <input type="hidden" name="tab" value={tab} />
          ) : null}
          {status ? (
            <input type="hidden" name="status" value={status} />
          ) : null}
          <div className="relative min-w-0 sm:min-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              name="q"
              defaultValue={resolvedSearchParams.q ?? ""}
              placeholder="Suche nach Name, E-Mail, Referenz..."
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
            />
          </div>
          <button className="h-10 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800">
            Suchen
          </button>
        </form>
      </div>

      {/* View Tabs switcher */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-sm">
        {viewTabs.map((vt) => {
          const isActive = tab === vt.value;
          return (
            <Link
              key={vt.value}
              href={buildFilterUrl(vt.value, status, q)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              {vt.label}
            </Link>
          );
        })}
      </div>

      {/* Status Filters switcher */}
      <div className="flex flex-wrap gap-1 items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
        <span className="font-semibold uppercase tracking-wider text-neutral-400 mr-2">Status:</span>
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((so) => {
            const isActive = status === so.value;
            return (
              <Link
                key={so.value || "all-status"}
                href={buildFilterUrl(tab, so.value, q)}
                className={`rounded-md px-3 py-1.5 font-medium transition ${
                  isActive
                    ? "bg-white text-neutral-950 font-semibold shadow-xs border border-neutral-200"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                {so.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.25fr_1fr_1fr_0.8fr_1fr_1fr_0.7fr] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 max-lg:hidden">
          <span>Kunde</span>
          <span>Zeitraum</span>
          <span>Status</span>
          <span>Produkte</span>
          <span>Preis</span>
          <span>Erstellt</span>
          <span className="text-right">Aktion</span>
        </div>

        <div className="divide-y divide-neutral-100">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/admin/bookings/${booking.id}`}
              className={`grid gap-4 px-5 py-4 transition hover:bg-neutral-50 lg:grid-cols-[1.25fr_1fr_1fr_0.8fr_1fr_1fr_0.7fr] lg:items-center ${
                booking.archivedAt ? "opacity-60 bg-neutral-50/50" : ""
              }`}
            >
              <div>
                <p className="font-semibold text-neutral-950">{getCustomerName(booking)}</p>
                <p className="mt-1 text-xs text-neutral-500">{booking.customer?.email || "Keine E-Mail"}</p>
                <p className="mt-1 text-xs font-medium text-blue-700">{booking.referenceCode}</p>
              </div>

              <div className="text-sm text-neutral-700">
                <span className="font-medium">{formatDate(booking.startDate)}</span>
                <span className="text-neutral-400"> bis </span>
                <span className="font-medium">{formatDate(booking.endDate)}</span>
              </div>

              <div className="flex flex-col gap-1 items-start">
                <BookingStatusBadge status={booking.status} />
                {booking.archivedAt && (
                  <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 border border-neutral-200/50">
                    Archiviert
                  </span>
                )}
              </div>

              <div className="text-sm text-neutral-700">{getProductSummary(booking)}</div>

              <div>
                <p className="text-sm font-semibold text-neutral-900">{getPriceSummary(booking)}</p>
                {booking.hasIndividualPricing ? (
                  <p className="mt-1 text-xs text-amber-700">Manuelle Kalkulation notig</p>
                ) : null}
              </div>

              <div className="text-sm text-neutral-600">{formatDateTime(booking.createdAt)}</div>

              <div className="text-right text-sm font-medium text-blue-700 max-lg:text-left">Details</div>
            </Link>
          ))}

          {bookings.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-medium text-neutral-800">Keine Anfragen gefunden.</p>
              <p className="mt-1 text-sm text-neutral-500">Passe Filter oder Suche an.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
