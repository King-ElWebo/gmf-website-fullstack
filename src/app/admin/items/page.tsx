import Link from "next/link";
import { listItems, parseItemListSort } from "@/lib/repositories/items";
import { listCategories } from "@/lib/repositories/categories";
import AdminPageHeader from "../_components/admin-page-header";
import ItemsSortableList from "./items-sortable-list";

export default async function AdminItemsPage({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedSearchParams = (await searchParams) ?? {};
    const sortParam = Array.isArray(resolvedSearchParams.sort) ? resolvedSearchParams.sort[0] : resolvedSearchParams.sort;
    const categoryParam = Array.isArray(resolvedSearchParams.categoryId)
        ? resolvedSearchParams.categoryId[0]
        : resolvedSearchParams.categoryId;
    const sort = parseItemListSort(sortParam);
    const categories = await listCategories();
    const categoryIds = new Set(categories.map((category) => category.id));
    const selectedCategoryId = categoryParam && categoryIds.has(categoryParam) ? categoryParam : undefined;
    const items = await listItems({ sort, categoryId: selectedCategoryId });
    const isManualSort = sort === "manual";
    const reorderEnabled = isManualSort && !selectedCategoryId;

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Items"
                description="Pflege Produkte, Inhalte und Preise in einer klaren, sortierbaren Uebersicht."
                action={{ href: "/admin/items/new", label: "New Item" }}
            />

            <form className="admin-surface rounded-[28px] p-4 sm:p-5 flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sortierung</label>
                    <select
                        name="sort"
                        defaultValue={sort}
                        className="min-w-52 rounded-xl px-3 py-2.5 text-sm"
                    >
                        <option value="manual">Manuelle Reihenfolge</option>
                        <option value="title_asc">Titel A-Z</option>
                        <option value="title_desc">Titel Z-A</option>
                        <option value="category_asc">Kategorie A-Z</option>
                        <option value="published_first">Status (Published zuerst)</option>
                        <option value="newest">Neueste zuerst</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Kategorie</label>
                    <select
                        name="categoryId"
                        defaultValue={selectedCategoryId ?? ""}
                        className="min-w-52 rounded-xl px-3 py-2.5 text-sm"
                    >
                        <option value="">Alle Kategorien</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.catalogType.name} / {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="admin-action-primary px-4 py-2.5 text-sm">Filter anwenden</button>

                <Link href="/admin/items" className="admin-action-secondary px-4 py-2.5 text-sm">
                    Zuruecksetzen
                </Link>
            </form>

            <div className="admin-surface rounded-[28px] p-4 sm:p-5">
                <ItemsSortableList initialItems={items} reorderEnabled={reorderEnabled} />
            </div>
        </div>
    );
}
