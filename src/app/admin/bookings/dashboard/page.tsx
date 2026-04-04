import Link from "next/link";
import { PrismaBookingRepository } from "@/lib/booking-core/infrastructure/database/PrismaBookingRepository";
import AdminPageHeader from "../../_components/admin-page-header";

export const dynamic = "force-dynamic";

export default async function BookingDashboard() {
  const repo = new PrismaBookingRepository();
  const stats = await repo.getDashboardStats();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Booking Dashboard"
        description="Uebersicht aller Anfragen, Konflikte und Systemsignale in einer ruhigen, priorisierten Arbeitsflaeche."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Offene Anfragen" value={stats.openRequestsCount} highlight={stats.openRequestsCount > 0 ? "yellow" : "none"} link="/admin/bookings?status=requested" />
        <StatCard title="Bald anstehend" value={stats.upcomingApprovedBookingsCount} highlight="green" link="/admin/bookings?status=approved" />
        <StatCard title="Mail Fehler" value={stats.failedEmailsCount} highlight={stats.failedEmailsCount > 0 ? "red" : "none"} link="/admin/emails" />
        <StatCard title="Kalender Fehler" value={stats.failedCalendarSyncsCount} highlight={stats.failedCalendarSyncsCount > 0 ? "red" : "none"} link="/admin/calendar" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <section className="admin-surface rounded-[28px] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Wichtige Arbeitswege fuer den taeglichen Betrieb direkt erreichbar.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Link href="/admin/bookings" className="admin-muted-surface rounded-[24px] p-5">
              <p className="text-sm font-semibold text-blue-700">Zu den Buchungen</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Anfragen sichten, Status aendern und Konflikte pruefen.</p>
            </Link>
            <Link href="/admin/resources" className="admin-surface-strong rounded-[24px] p-5 hover:border-blue-200">
              <p className="text-sm font-semibold text-slate-900">Ressourcen verwalten</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Bestand, Tracking und Verfuegbarkeit strukturiert ueberblicken.</p>
            </Link>
          </div>
        </section>

        <aside className="admin-surface rounded-[28px] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Prioritaeten</h2>
          <div className="mt-4 space-y-4">
            <PriorityItem label="Offene Anfragen" value={stats.openRequestsCount} tone="yellow" />
            <PriorityItem label="Mail Fehler" value={stats.failedEmailsCount} tone="red" />
            <PriorityItem label="Kalender Fehler" value={stats.failedCalendarSyncsCount} tone="red" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ title, value, highlight, link }: { title: string; value: number; highlight: "red" | "green" | "yellow" | "none"; link: string }) {
  const accent =
    highlight === "red"
      ? "border-red-200 bg-red-50/80 text-red-700"
      : highlight === "yellow"
        ? "border-amber-200 bg-amber-50/80 text-amber-700"
        : highlight === "green"
          ? "border-emerald-200 bg-emerald-50/80 text-emerald-700"
          : "border-slate-200 bg-white text-slate-900";

  return (
    <Link href={link} className={`admin-stat-card rounded-[26px] p-5 ${accent}`}>
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-4xl font-semibold tracking-tight">{value}</div>
    </Link>
  );
}

function PriorityItem({ label, value, tone }: { label: string; value: number; tone: "yellow" | "red" }) {
  const badgeClass = tone === "red" ? "admin-badge admin-badge-red" : "admin-badge admin-badge-yellow";
  const valueClass = tone === "red" ? "text-red-700" : "text-amber-700";

  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-white/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-1 text-sm text-slate-500">Sofort sichtbare Signale fuer das Team.</p>
        </div>
        <span className={badgeClass}>{tone === "red" ? "Attention" : "Pending"}</span>
      </div>
      <div className={`mt-4 text-2xl font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}
