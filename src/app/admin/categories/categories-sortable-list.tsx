"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SortableRowList from "../_components/sortable-row-list";
import { AdminButton } from "../_components/ui/AdminButton";

type CategoryRow = {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    catalogType: {
        name: string;
        slug: string;
    };
};

export default function CategoriesSortableList({
    initialCategories,
    reorderEnabled = true,
}: {
    initialCategories: CategoryRow[];
    reorderEnabled?: boolean;
}) {
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
            reorderEnabled={reorderEnabled}
            emptyText="Keine Kategorien vorhanden."
            columns={[
                {
                    key: "preview",
                    header: "Vorschau",
                    render: (category) => (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {category.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                                    Ohne
                                </div>
                            )}
                        </div>
                    ),
                },
                {
                    key: "name",
                    header: "Name",
                    render: (category) => (
                        <Link href={`/admin/categories/${category.id}/edit`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                            {category.name}
                        </Link>
                    ),
                },
                {
                    key: "slug",
                    header: "Slug",
                    render: (category) => <span className="text-slate-500">{category.slug}</span>,
                },
                {
                    key: "catalogType",
                    header: "Katalogtyp",
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
                    <Link href={`/admin/categories/${category.id}/edit`}>
                        <AdminButton variant="secondary" size="sm">
                            Bearbeiten
                        </AdminButton>
                    </Link>
                    <AdminButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(category.id, category.name)}
                    >
                        Löschen
                    </AdminButton>
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
