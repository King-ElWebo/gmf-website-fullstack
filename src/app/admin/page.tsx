import Link from "next/link";
import { db } from "@/lib/db";
import AdminPageHeader from "./_components/admin-page-header";
import {
  Calendar,
  PackageSearch,
  PackagePlus,
  Image as ImageIcon,
  MessageSquare,
  ListTree,
  CheckCircle2,
  Clock,
  Archive,
  ChevronRight,
  HardDrive,
  Mail,
  AlertCircle,
  Truck,
  MapPin
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export default async function AdminHome() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [
    openInquiries,
    openInquiriesCount,
    upcomingBookings,
    upcomingBookingsCount,
    thisWeekBookingsCount,
    archivedCount,
    totalCatalogTypes,
    totalCategories,
    totalItems,
  ] = await Promise.all([
    db.booking.findMany({
      where: { status: "requested", archivedAt: null },
      orderBy: { createdAt: "asc" },
      take: 5,
      include: { customer: true, items: { include: { item: true } } },
    }),
    db.booking.count({
      where: { status: "requested", archivedAt: null },
    }),
    db.booking.findMany({
      where: { status: "approved", endDate: { gte: today }, archivedAt: null },
      orderBy: { startDate: "asc" },
      take: 5,
      include: { customer: true, items: { include: { item: true } } },
    }),
    db.booking.count({
      where: { status: "approved", endDate: { gte: today }, archivedAt: null },
    }),
    db.booking.count({
      where: {
        status: "approved",
        archivedAt: null,
        startDate: { lte: nextWeek },
        endDate: { gte: today },
      },
    }),
    db.booking.count({
      where: { archivedAt: { not: null } },
    }),
    db.catalogType.count(),
    db.category.count(),
    db.item.count(),
  ]);

  const hasVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Betriebszentrale"
        description="Dein täglicher Überblick über offene Anfragen, Buchungen und wichtige Aktionen."
      />

      {/* 1. Top-Kennzahlen */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          title="Offene Anfragen"
          value={openInquiriesCount}
          icon={<Clock className="text-amber-500" size={24} />}
          accent="amber"
          link="/admin/bookings/dashboard?status=requested"
        />
        <MetricCard
          title="Kommende Buchungen"
          value={upcomingBookingsCount}
          icon={<Calendar className="text-blue-500" size={24} />}
          accent="blue"
          link="/admin/bookings/dashboard?status=approved"
        />
        <MetricCard
          title="Diese Woche"
          value={thisWeekBookingsCount}
          icon={<CheckCircle2 className="text-emerald-500" size={24} />}
          accent="emerald"
        />
        <MetricCard
          title="Archiviert"
          value={archivedCount}
          icon={<Archive className="text-slate-400" size={24} />}
          accent="slate"
          link="/admin/bookings/dashboard?status=archived"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr] items-stretch">
        
        <div className="flex flex-col gap-4">
          {/* 2. Offene Anfragen */}
          <section className="admin-surface rounded-[24px] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Offene Anfragen</h2>
                <p className="mt-1 text-sm text-slate-500">Kunden warten auf Bestätigung oder Angebot.</p>
              </div>
              <Link href="/admin/bookings/dashboard?status=requested" className="font-medium text-blue-600 hover:text-blue-800">
                Alle ansehen
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {openInquiries.map((booking) => (
                <div key={booking.id} className="flex flex-col gap-4 rounded-[24px] border border-amber-200/60 bg-amber-50/30 p-4 hover:border-amber-300 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-md">
                        {booking.referenceCode}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PackageSearch size={14} className="text-slate-400" />
                        {booking.items.length} {booking.items.length === 1 ? "Produkt" : "Produkte"}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm ring-1 ring-inset ring-amber-200 hover:bg-amber-50 sm:w-auto"
                  >
                    Ansehen
                    <ChevronRight size={16} />
                  </Link>
                </div>
              ))}
              {openInquiries.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 py-8 text-center">
                  <CheckCircle2 size={32} className="text-emerald-500 mb-3" />
                  <p className="text-sm font-medium text-slate-900">Keine offenen Anfragen!</p>
                  <p className="text-xs text-slate-500 mt-1">Alle Kunden wurden bedient.</p>
                </div>
              )}
            </div>
          </section>

          {/* 3. Nächste bestätigte Buchungen */}
          <section className="admin-surface rounded-[24px] p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Nächste Buchungen</h2>
                <p className="mt-1 text-sm text-slate-500">Bestätigte Einsätze, die in Kürze anstehen.</p>
              </div>
              <Link href="/admin/bookings/dashboard?status=approved" className="font-medium text-blue-600 hover:text-blue-800">
                Alle ansehen
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {upcomingBookings.map((booking) => {
                const isDelivery = booking.deliveryType === "delivery";
                return (
                  <div key={booking.id} className="flex flex-col gap-4 rounded-[24px] border border-blue-200/60 bg-blue-50/30 p-4 hover:border-blue-300 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {booking.customer?.firstName} {booking.customer?.lastName}
                        </span>
                        {isDelivery ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            <Truck size={12} />
                            Lieferung
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            <MapPin size={12} />
                            Selbstabholer
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-blue-500" />
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <PackageSearch size={14} className="text-slate-400" />
                          {booking.items.length} {booking.items.length === 1 ? "Produkt" : "Produkte"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-inset ring-blue-200 hover:bg-blue-50 sm:w-auto"
                    >
                      Details
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                );
              })}
              {upcomingBookings.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 py-8 text-center min-h-[160px]">
                  <Calendar size={32} className="text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-900">Keine kommenden Einsätze.</p>
                  <p className="text-xs text-slate-500 mt-1">Aktuell stehen keine bestätigten Buchungen an.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          {/* 4. Quick Actions */}
          <section className="admin-surface rounded-[24px] p-5 flex-1 flex flex-col">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Tagesgeschäft</h2>
              <div className="mt-4 flex flex-col gap-3">
              <ActionCard 
                href="/admin/bookings/dashboard" 
                title="Booking Dashboard" 
                text="Alle Anfragen und Buchungen" 
                icon={<Calendar />} 
                isPrimary 
              />
              <ActionCard 
                href="/admin/items/new" 
                title="Neues Produkt" 
                text="Hüpfburg oder Modul anlegen" 
                icon={<PackagePlus />} 
                isPrimary 
              />
              <ActionCard 
                href="/admin/items" 
                title="Produktliste" 
                text="Bestand & Preise pflegen" 
                icon={<PackageSearch />} 
                isPrimary 
              />
              <ActionCard 
                href="/admin/images/new" 
                title="Bild hochladen" 
                text="Zentrale Medienverwaltung" 
                icon={<ImageIcon />} 
                isPrimary 
              />
            </div>
          </div>

          <div className="mt-auto pt-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Erweiterte Struktur</h3>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <MiniActionCard href="/admin/categories/new" title="Kategorie" icon={<ListTree size={16} />} />
                <MiniActionCard href="/admin/faqs/new" title="FAQ" icon={<MessageSquare size={16} />} />
                <MiniActionCard href="/admin/catalog-types/new" title="Katalog" icon={<PackageSearch size={16} />} />
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, accent, link }: { title: string; value: number; icon: React.ReactNode; accent: "amber" | "blue" | "emerald" | "slate"; link?: string }) {
  const bgColors = {
    amber: "bg-gradient-to-br from-amber-50 to-white",
    blue: "bg-gradient-to-br from-blue-50 to-white",
    emerald: "bg-gradient-to-br from-emerald-50 to-white",
    slate: "bg-white",
  };
  
  const content = (
    <div className={`admin-stat-card rounded-[26px] p-5 h-full transition-transform hover:-translate-y-0.5 ${bgColors[accent]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon}
      </div>
      <p className="text-4xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );

  if (link) {
    return <Link href={link} className="block h-full">{content}</Link>;
  }

  return content;
}

function ActionCard({ href, title, text, icon, isPrimary }: { href: string; title: string; text: string; icon: React.ReactNode; isPrimary?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-[20px] border p-4 transition-all hover:-translate-y-0.5 ${
        isPrimary 
          ? "border-blue-100 bg-blue-50/50 hover:border-blue-200 hover:bg-blue-50" 
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isPrimary ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors" : "bg-slate-100 text-slate-600"}`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-semibold ${isPrimary ? "text-slate-900" : "text-slate-700"}`}>{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{text}</p>
      </div>
    </Link>
  );
}

function MiniActionCard({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-white p-3 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-600 hover:text-slate-900"
    >
      {icon}
      <span className="text-xs font-semibold">{title}</span>
    </Link>
  );
}

function ContentStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[16px] border border-slate-100 bg-slate-50/50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function StatusBadge({ label, active, activeText, inactiveText, icon }: { label: string; active: boolean; activeText: string; inactiveText: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-[16px] border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <div className="text-slate-400">{icon}</div>
        {label}
      </div>
      <div className={`px-2 py-0.5 rounded-md text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
        {active ? activeText : inactiveText}
      </div>
    </div>
  );
}
