import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminHome() {
  // 1. Statistics
  const totalCategories = await db.category.count();
  const totalItems = await db.item.count();
  const totalFaqs = await (db as any).faq?.count() ?? 0;
  const totalImages = await (db as any).globalImage?.count() ?? 0;


  // 5. Letzte/Wichtigste Items
  const recentItems = await db.item.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: true },
  });

  // 4. Letzte Bilder
  const recentImages = await (db as any).globalImage?.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  }) ?? [];


  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-neutral-600 text-sm">
          Willkommen im Admin-Bereich. Hier ist eine Übersicht deines Systems.
        </p>
      </div>

      {/* 1. Statistik-Sektion */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
          <span className="text-sm font-medium text-neutral-500">Kategorien</span>
          <span className="text-3xl font-semibold mt-2">{totalCategories}</span>
        </div>
        <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
          <span className="text-sm font-medium text-neutral-500">Items</span>
          <span className="text-3xl font-semibold mt-2">{totalItems}</span>
        </div>
        <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
          <span className="text-sm font-medium text-neutral-500">FAQs</span>
          <span className="text-3xl font-semibold mt-2">{totalFaqs}</span>
        </div>
        <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
          <span className="text-sm font-medium text-neutral-500">Bilder</span>
          <span className="text-3xl font-semibold mt-2">{totalImages}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/admin/categories/new" className="group flex flex-col items-center justify-center p-5 border rounded-xl bg-white hover:bg-neutral-50 hover:border-blue-200 hover:shadow-sm transition-all text-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </div>
              <span className="text-sm font-medium text-neutral-700">Neue Kategorie</span>
            </Link>
            <Link href="/admin/items/new" className="group flex flex-col items-center justify-center p-5 border rounded-xl bg-white hover:bg-neutral-50 hover:border-blue-200 hover:shadow-sm transition-all text-center gap-3">
              <div className="p-3 bg-green-50 text-green-600 rounded-full group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </div>
              <span className="text-sm font-medium text-neutral-700">Neues Item</span>
            </Link>
            <Link href="/admin/faqs/new" className="group flex flex-col items-center justify-center p-5 border rounded-xl bg-white hover:bg-neutral-50 hover:border-blue-200 hover:shadow-sm transition-all text-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </div>
              <span className="text-sm font-medium text-neutral-700">Neue FAQ</span>
            </Link>
            <Link href="/admin/images/new" className="group flex flex-col items-center justify-center p-5 border rounded-xl bg-white hover:bg-neutral-50 hover:border-blue-200 hover:shadow-sm transition-all text-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-full group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
              <span className="text-sm font-medium text-neutral-700">Bild hochladen</span>
            </Link>
          </div>
        </div>

        {/* 3. Letzte Aktivitäten */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Letzte Aktivitäten</h2>
          <div className="border rounded-xl bg-white p-5 space-y-5 h-full">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500 shrink-0 shadow-sm shadow-blue-200"></div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Kategorie erstellt</p>
                <p className="text-xs text-neutral-500 mt-0.5">Vor 10 Minuten</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-green-500 shrink-0 shadow-sm shadow-green-200"></div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Item bearbeitet</p>
                <p className="text-xs text-neutral-500 mt-0.5">Vor 1 Stunde</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-purple-500 shrink-0 shadow-sm shadow-purple-200"></div>
              <div>
                <p className="text-sm font-medium text-neutral-800">FAQ aktualisiert</p>
                <p className="text-xs text-neutral-500 mt-0.5">Vor 3 Stunden</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-orange-500 shrink-0 shadow-sm shadow-orange-200"></div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Bild hochgeladen</p>
                <p className="text-xs text-neutral-500 mt-0.5">Gestern</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Kompakte Items Tabelle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Letzte Items</h2>
            <Link href="/admin/items" className="text-sm font-medium text-neutral-600 hover:text-black hover:underline transition-colors px-2 py-1">
              Alle Items &rarr;
            </Link>
          </div>
          <div className="border rounded-xl bg-white overflow-hidden text-sm shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/80 border-b">
                <tr>
                  <th className="p-4 font-medium text-neutral-600">Name</th>
                  <th className="p-4 font-medium text-neutral-600">Kategorie</th>
                  <th className="p-4 font-medium text-neutral-600">Preis</th>
                  <th className="p-4 font-medium text-neutral-600 text-center">Status</th>
                  <th className="p-4 font-medium text-neutral-600 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4 font-medium text-neutral-800">
                      <Link href={`/admin/items/${item.id}/edit`} className="hover:underline">
                        {item.title}
                      </Link>
                    </td>
                    <td className="p-4 text-neutral-600">{item.category?.name || "-"}</td>
                    <td className="p-4 text-neutral-600">
                      {item.priceCents != null ? `$${(item.priceCents / 100).toFixed(2)}` : "-"}
                    </td>
                    <td className="p-4 text-center">
                      {item.published ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-green-100 text-green-700 tracking-wide uppercase">
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-600 tracking-wide uppercase">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/items/${item.id}/edit`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">
                      Keine Items vorhanden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Letzte Bilder Überblicksbereich */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Zuletzt hochgeladene Bilder</h2>
            <Link href="/admin/images" className="text-sm font-medium text-neutral-600 hover:text-black hover:underline transition-colors px-2 py-1">
              Alle Bilder &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentImages.map((img: any) => (
              <div key={img.id} className="group relative border rounded-xl overflow-hidden bg-neutral-100 shadow-sm aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || "Bild"} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] text-white font-medium px-2 py-1 bg-black/60 rounded-md backdrop-blur-md shadow-sm border border-white/20 uppercase tracking-wide">
                    {img.area?.toLowerCase() || "other"}
                  </span>
                </div>
              </div>
            ))}
            {recentImages.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-neutral-500 border border-dashed rounded-xl bg-neutral-50/50">
                Noch keine Bilder hochgeladen.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}