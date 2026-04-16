import Link from "next/link";
import { db } from "@/lib/db";
import { getItemPriceDisplay } from "@/lib/items/price";
import AdminPageHeader from "./_components/admin-page-header";

export default async function AdminHome() {
  const totalCatalogTypes = await db.catalogType.count();
  const totalCategories = await db.category.count();
  const totalItems = await db.item.count();
  const totalFaqs = 0;
  const totalImages = 0;

  const recentItems = await db.item.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: true },
  });

  const recentImages: any[] = [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Ein moderner Ueberblick ueber Inhalte, Medien und zentrale Arbeitsbereiche deines Admin-Backends."
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <OverviewCard title="Katalogtypen" value={totalCatalogTypes} accent="blue" />
        <OverviewCard title="Kategorien" value={totalCategories} accent="slate" />
        <OverviewCard title="Items" value={totalItems} accent="blue" />
        <OverviewCard title="FAQs" value={totalFaqs} accent="slate" />
        <OverviewCard title="Bilder" value={totalImages} accent="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="admin-surface rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-slate-500">Direkte Einstiege fuer haeufige Verwaltungsaufgaben.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ActionCard href="/admin/catalog-types/new" title="Neuer Katalogtyp" text="Neue Inhaltsstruktur anlegen" tone="blue" />
            <ActionCard href="/admin/categories/new" title="Neue Kategorie" text="Navigation und Zuordnung erweitern" tone="slate" />
            <ActionCard href="/admin/items/new" title="Neues Item" text="Produkte und Inhalte erfassen" tone="blue" />
            <ActionCard href="/admin/faqs/new" title="Neue FAQ" text="Hilfreiche Antworten pflegen" tone="slate" />
            <ActionCard href="/admin/images/new" title="Bild hochladen" text="Medien zentral verwalten" tone="blue" />
            <ActionCard href="/admin/bookings/dashboard" title="Booking Dashboard" text="Anfragen und Signale priorisieren" tone="slate" />
          </div>
        </section>

        <aside className="admin-surface rounded-[30px] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Status</h2>
          <div className="mt-4 space-y-4">
            <StatusRow title="Struktur verwalten" text="Katalogtypen, Kategorien und Items in einer konsistenten Admin-Shell." />
            <StatusRow title="Inhalte aktualisieren" text="FAQs, Medien und Seiteneinstellungen mit besserer Lesbarkeit pflegen." />
            <StatusRow title="Betrieb im Blick" text="Buchungen, Ressourcen und Kalender sind prominent erreichbar." />
          </div>
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="admin-surface rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Letzte Items</h2>
              <p className="mt-1 text-sm text-slate-500">Aktuelle Produkte mit Preis und Status auf einen Blick.</p>
            </div>
            <Link href="/admin/items" className="font-medium text-blue-600 hover:text-blue-800">
              Alle Items
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentItems.map((item) => (
              <Link
                key={item.id}
                href={`/admin/items/${item.id}/edit`}
                className="flex flex-col gap-3 rounded-[24px] border border-slate-200/70 bg-white/90 p-4 hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.category?.name || "Keine Kategorie"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600">{getItemPriceDisplay(item)}</span>
                  <span className={`admin-badge ${item.published ? "admin-badge-green" : "admin-badge-neutral"}`}>
                    {item.published ? "Aktiv" : "Draft"}
                  </span>
                </div>
              </Link>
            ))}
            {recentItems.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
                Keine Items vorhanden.
              </div>
            ) : null}
          </div>
        </section>

        <section className="admin-surface rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Zuletzt hochgeladene Bilder</h2>
              <p className="mt-1 text-sm text-slate-500">Medien mit schneller visueller Kontrolle.</p>
            </div>
            <Link href="/admin/images" className="font-medium text-blue-600 hover:text-blue-800">
              Alle Bilder
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {recentImages.map((img) => (
              <div key={img.id} className="group relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || "Bild"} className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
                <div className="absolute left-3 top-3">
                  <span className="admin-badge admin-badge-blue">{img.area.toLowerCase()}</span>
                </div>
              </div>
            ))}
            {recentImages.length === 0 ? (
              <div className="col-span-full rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
                Noch keine Bilder hochgeladen.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function OverviewCard({ title, value, accent }: { title: string; value: number; accent: "blue" | "slate" }) {
  return (
    <div className={`admin-stat-card rounded-[26px] p-5 ${accent === "blue" ? "bg-gradient-to-br from-blue-50 to-white" : "bg-white"}`}>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function ActionCard({ href, title, text, tone }: { href: string; title: string; text: string; tone: "blue" | "slate" }) {
  return (
    <Link
      href={href}
      className={`rounded-[24px] border p-5 ${tone === "blue" ? "border-blue-100 bg-blue-50/70 hover:border-blue-200" : "border-slate-200 bg-white hover:border-blue-200"} transition-all hover:-translate-y-0.5`}
    >
      <p className={`text-sm font-semibold ${tone === "blue" ? "text-blue-700" : "text-slate-900"}`}>{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}

function StatusRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-white/90 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
