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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">Anfragen</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Prufe eingegangene Anfragen, Preise, Produkte und Kundendaten auf einen Blick.
          </p>
        </div>

        <form action="/admin/bookings" className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto admin-surface p-2 rounded-2xl items-center">
          {tab && tab !== "active" ? (
            <input type="hidden" name="tab" value={tab} />
          ) : null}
          {status ? (
            <input type="hidden" name="status" value={status} />
          ) : null}
          <div className="relative min-w-0 flex-1 sm:min-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={resolvedSearchParams.q ?? ""}
              placeholder="Suche nach Name, E-Mail, Referenz..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>
          <button className="admin-action-primary px-4 py-2 text-sm h-10 w-full sm:w-auto">
            Suchen
          </button>
        </form>
      </div>

      {/* View Tabs switcher */}
      <div className="flex flex-wrap gap-2 admin-surface rounded-[20px] p-2">
        {viewTabs.map((vt) => {
          const isActive = tab === vt.value;
          return (
            <Link
              key={vt.value}
              href={buildFilterUrl(vt.value, status, q)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              {vt.label}
            </Link>
          );
        })}
      </div>

      {/* Status Filters switcher */}
      <div className="flex flex-wrap gap-1 items-center rounded-[20px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <span className="font-semibold uppercase tracking-wider text-slate-400 mr-2">Status:</span>
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((so) => {
            const isActive = status === so.value;
            return (
              <Link
                key={so.value || "all-status"}
                href={buildFilterUrl(tab, so.value, q)}
                className={`rounded-[10px] px-3 py-1.5 font-medium transition-colors ${
                  isActive
                    ? "bg-white text-slate-900 font-semibold shadow-sm border border-slate-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                }`}
              >
                {so.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="admin-surface rounded-[28px] p-4 sm:p-5">
        <div className="admin-table rounded-[26px]">
          <div className="hidden px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:grid lg:grid-cols-[1.25fr_1fr_1fr_0.8fr_1fr_1fr_0.7fr] lg:gap-4">
            <span>Kunde</span>
            <span>Zeitraum</span>
            <span>Status</span>
            <span>Produkte</span>
            <span>Preis</span>
            <span>Erstellt</span>
            <span className="text-right">Aktion</span>
          </div>

          <div>
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className={`grid gap-4 px-5 py-4 transition-colors hover:bg-blue-50/40 border-t border-slate-200/70 bg-white/90 lg:grid-cols-[1.25fr_1fr_1fr_0.8fr_1fr_1fr_0.7fr] lg:items-center ${
                  booking.archivedAt ? "opacity-60 bg-slate-50/50" : ""
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-900">{getCustomerName(booking)}</p>
                  <p className="mt-1 text-xs text-slate-500">{booking.customer?.email || "Keine E-Mail"}</p>
                  <p className="mt-1 text-xs font-medium text-blue-600">{booking.referenceCode}</p>
                </div>

                <div className="text-sm text-slate-700">
                  <span className="font-medium">{formatDate(booking.startDate)}</span>
                  <span className="text-slate-400"> bis </span>
                  <span className="font-medium">{formatDate(booking.endDate)}</span>
                </div>

                <div className="flex flex-col gap-1 items-start">
                  <BookingStatusBadge status={booking.status} />
                  {booking.archivedAt && (
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border border-slate-200/50">
                      Archiviert
                    </span>
                  )}
                </div>

                <div className="text-sm text-slate-700">{getProductSummary(booking)}</div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">{getPriceSummary(booking)}</p>
                  {booking.hasIndividualPricing ? (
                    <p className="mt-1 text-xs text-amber-700">Manuelle Kalkulation notig</p>
                  ) : null}
                </div>

                <div className="text-sm text-slate-600">{formatDateTime(booking.createdAt)}</div>

                <div className="text-right text-sm font-medium text-blue-600 max-lg:text-left">Details</div>
              </Link>
            ))}

            {bookings.length === 0 ? (
              <div className="px-5 py-14 text-center border-t border-slate-200/70 bg-white/90">
                <p className="font-medium text-slate-800">Keine Anfragen gefunden.</p>
                <p className="mt-1 text-sm text-slate-500">Passe Filter oder Suche an.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
