"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
    const router = useRouter();

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Möchten Sie den Katalog-Bereich "${name}" wirklich löschen?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/catalog-types/${id}`, {
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
                <div className="flex items-center gap-3">
                    <Link className="font-medium text-blue-600 hover:text-blue-800" href={`/admin/catalog-types/${type.id}/edit`}>
                        Bearbeiten
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDelete(type.id, type.name)}
                        className="font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                        Löschen
                    </button>
                </div>
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
