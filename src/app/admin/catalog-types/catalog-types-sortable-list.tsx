"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SortableRowList from "../_components/sortable-row-list";
import { AdminBadge } from "../_components/ui/AdminBadge";
import { AdminButton } from "../_components/ui/AdminButton";

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
                        <AdminBadge variant={type.isActive ? "green" : "gray"}>
                            {type.isActive ? "Active" : "Inactive"}
                        </AdminBadge>
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
                    <Link href={`/admin/catalog-types/${type.id}/edit`}>
                        <AdminButton variant="secondary" size="sm">
                            Bearbeiten
                        </AdminButton>
                    </Link>
                    <AdminButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(type.id, type.name)}
                    >
                        Löschen
                    </AdminButton>
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
