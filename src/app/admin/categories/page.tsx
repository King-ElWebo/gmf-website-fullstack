import Link from "next/link";
import { listCategories } from "@/lib/repositories/categories";
import { listCatalogTypes } from "@/lib/repositories/catalog-types";
import AdminPageHeader from "../_components/admin-page-header";
import CategoriesSortableList from "./categories-sortable-list";

export default async function AdminCategoriesPage({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedSearchParams = (await searchParams) ?? {};
    const catalogTypeParam = Array.isArray(resolvedSearchParams.catalogTypeId)
        ? resolvedSearchParams.catalogTypeId[0]
        : resolvedSearchParams.catalogTypeId;

    const catalogTypes = await listCatalogTypes();
    const catalogTypeIds = new Set(catalogTypes.map((ct) => ct.id));
    const selectedCatalogTypeId = catalogTypeParam && catalogTypeIds.has(catalogTypeParam) ? catalogTypeParam : undefined;

    const categories = await listCategories({ catalogTypeId: selectedCatalogTypeId });
    const reorderEnabled = !selectedCatalogTypeId;

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Categories"
                description="Strukturiere den Katalog mit klaren Bereichen und schneller Bearbeitung."
                action={{ href: "/admin/categories/new", label: "New Category" }}
            />

            <form className="admin-surface rounded-[28px] p-4 sm:p-5 flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Katalogtyp (Seite)</label>
                    <select
                        name="catalogTypeId"
                        defaultValue={selectedCatalogTypeId ?? ""}
                        className="min-w-52 rounded-xl px-3 py-2.5 text-sm border border-slate-200"
                    >
                        <option value="">Alle Katalogtypen</option>
                        {catalogTypes.map((ct) => (
                            <option key={ct.id} value={ct.id}>
                                {ct.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="admin-action-primary px-4 py-2.5 text-sm">Filter anwenden</button>

                <Link href="/admin/categories" className="admin-action-secondary px-4 py-2.5 text-sm">
                    Zurücksetzen
                </Link>
            </form>

            <div className="admin-surface rounded-[28px] p-4 sm:p-5">
                <CategoriesSortableList initialCategories={categories} reorderEnabled={reorderEnabled} />
            </div>
        </div>
    );
}
