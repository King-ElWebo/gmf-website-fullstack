"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SortableRowList from "../_components/sortable-row-list";

type CategoryRow = {
    id: string;
    name: string;
    slug: string;
    catalogType: {
        name: string;
        slug: string;
    };
};

export default function CategoriesSortableList({ initialCategories }: { initialCategories: CategoryRow[] }) {
    const router = useRouter();

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Möchten Sie die Kategorie "${name}" wirklich löschen?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || "Löschen fehlgeschlagen.");
                return;
            }

            router.refresh();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Ein unerwarteter Fehler ist aufgetreten.");
        }
    };

    return (
        <SortableRowList
            items={initialCategories}
            emptyText="No categories yet."
            columns={[
                {
                    key: "name",
                    header: "Name",
                    render: (category) => <div className="font-semibold text-slate-900">{category.name}</div>,
                },
                {
                    key: "slug",
                    header: "Slug",
                    render: (category) => <span className="text-slate-500">{category.slug}</span>,
                },
                {
                    key: "catalogType",
                    header: "Catalog Type",
                    render: (category) => (
                        <div>
                            <div className="font-medium text-slate-700">{category.catalogType.name}</div>
                            <div className="text-xs text-slate-400">{category.catalogType.slug}</div>
                        </div>
                    ),
                },
            ]}
            renderActions={(category) => (
                <div className="flex items-center gap-3">
                    <Link className="font-medium text-blue-600 hover:text-blue-800" href={`/admin/categories/${category.id}/edit`}>
                        Bearbeiten
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDelete(category.id, category.name)}
                        className="font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                        Löschen
                    </button>
                </div>
            )}
            onReorder={async (orderedIds) => {
                const res = await fetch("/api/admin/categories/reorder", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderedIds }),
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data?.error ?? "Reorder failed");
                }

                return data.categories;
            }}
        />
    );
}
