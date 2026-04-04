import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import AdminPageHeader from "../_components/admin-page-header";

export const dynamic = "force-dynamic";

type ResourceItem = Prisma.ItemGetPayload<{ include: { category: true } }>;

export default async function AdminResourcesPage() {
  const items = await db.item.findMany({ include: { category: true }, orderBy: { title: "asc" } });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ressourcen & Bestand"
        description="Ueberwache Inventar, Tracking und verfuegbare Kapazitaeten mit klarer Tabellenstruktur."
      />

      <div className="admin-table rounded-[28px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="p-4">Titel / Name</th>
              <th className="p-4">Kategorie</th>
              <th className="p-4">Typ</th>
              <th className="p-4 text-center">Bestands-Tracking</th>
              <th className="p-4 text-center">Auf Lager</th>
              <th className="p-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {items.map((item: ResourceItem) => (
              <tr key={item.id}>
                <td className="p-4 font-semibold text-slate-900">
                  <Link href={`/admin/items/${item.id}/edit`} className="hover:text-blue-700">
                    {item.title}
                  </Link>
                </td>
                <td className="p-4 text-slate-500">{item.category?.name || "-"}</td>
                <td className="p-4 text-slate-500 capitalize">{item.type}</td>
                <td className="p-4 text-center">
                  {item.trackInventory ? <span className="admin-badge admin-badge-green">Aktiv</span> : <span className="admin-badge admin-badge-neutral">Aus</span>}
                </td>
                <td className="p-4 text-center">
                  {item.trackInventory ? (
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${item.totalStock <= 1 ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                      {item.totalStock} Stueck
                    </span>
                  ) : "-"}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/items/${item.id}/edit`} className="font-medium text-blue-600 hover:text-blue-800">
                    Bearbeiten
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Keine Items vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
