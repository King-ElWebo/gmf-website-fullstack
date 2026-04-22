"use client";

import Link from "next/link";
import SortableRowList from "../_components/sortable-row-list";

type CatalogTypeRow = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    _count: {
        categories: number;
    };
};

export default function CatalogTypesSortableList({ initialCatalogTypes }: { initialCatalogTypes: CatalogTypeRow[] }) {
    return (
        <SortableRowList
            items={initialCatalogTypes}
            emptyText="No catalog types yet."
            columns={[
                {
                    key: "name",
                    header: "Name",
                    render: (type) => (
                        <div>
                            <div className="font-semibold text-slate-900">{type.name}</div>
                            {type.description && <div className="mt-1 text-xs leading-5 text-slate-500">{type.description}</div>}
                        </div>
                    ),
                },
                {
                    key: "slug",
                    header: "Slug",
                    render: (type) => <span className="text-slate-500">{type.slug}</span>,
                },
                {
                    key: "status",
                    header: "Status",
                    render: (type) => (
                        <span className={`admin-badge ${type.isActive ? "admin-badge-green" : "admin-badge-neutral"}`}>
                            {type.isActive ? "Active" : "Inactive"}
                        </span>
                    ),
                },
                {
                    key: "categories",
                    header: "Categories",
                    render: (type) => <span className="text-slate-600">{type._count.categories}</span>,
                },
            ]}
            renderActions={(type) => (
                <Link className="font-medium text-blue-600 hover:text-blue-800" href={`/admin/catalog-types/${type.id}/edit`}>
                    Edit
                </Link>
            )}
            onReorder={async (orderedIds) => {
                const res = await fetch("/api/admin/catalog-types/reorder", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderedIds }),
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data?.error ?? "Reorder failed");
                }

                return data.catalogTypes;
            }}
        />
    );
}
