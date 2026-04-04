"use client";

import Link from "next/link";
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
                <Link className="font-medium text-blue-600 hover:text-blue-800" href={`/admin/categories/${category.id}/edit`}>
                    Edit
                </Link>
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
