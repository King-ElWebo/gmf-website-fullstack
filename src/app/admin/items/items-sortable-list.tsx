"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getItemPriceDisplay } from "@/lib/items/price";
import SortableRowList from "../_components/sortable-row-list";
import { AdminButton } from "../_components/ui/AdminButton";

type ItemRow = {
    id: string;
    title: string;
    slug: string;
    images?: {
        id: string;
        url: string;
        alt: string | null;
    }[];
    priceType: "FIXED" | "ON_REQUEST" | "FROM_PRICE";
    basePriceCents: number | null;
    priceLabel: string | null;
    published: boolean;
    trackInventory: boolean;
    totalStock: number;
    category: {
        name: string | null;
        catalogType?: {
            name: string;
        } | null;
    } | null;
};

export default function ItemsSortableList({
    initialItems,
    reorderEnabled = true,
}: {
    initialItems: ItemRow[];
    reorderEnabled?: boolean;
}) {
    const router = useRouter();

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Möchten Sie das Produkt "${title}" wirklich löschen?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/items/${id}`, {
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
            items={initialItems}
            reorderEnabled={reorderEnabled}
            emptyText="Keine Produkte vorhanden."
            gridTemplate="40px minmax(200px, 3fr) minmax(130px, 1.5fr) minmax(100px, 1fr) minmax(80px, 0.8fr) minmax(80px, 0.8fr) minmax(80px, 0.8fr) 160px"
            columns={[
                {
                    key: "title",
                    header: "Titel",
                    render: (item) => {
                        const image = item.images?.[0];

                        return (
                            <Link href={`/admin/items/${item.id}/edit`} className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity">
                                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                    {image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={image.url}
                                            alt={image.alt ?? item.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                            Bild
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 leading-snug hover:text-blue-600 transition-colors">{item.title}</div>
                                </div>
                            </Link>
                        );
                    },
                },
                {
                    key: "category",
                    header: "Kategorie",
                    render: (item) => (
                        <div>
                            <div className="font-medium text-slate-700">{item.category?.name || "Keine"}</div>
                            {item.category?.catalogType?.name && (
                                <div className="text-xs text-slate-400">{item.category.catalogType.name}</div>
                            )}
                        </div>
                    ),
                },
                {
                    key: "price",
                    header: "Preis",
                    render: (item) => <span className="font-medium text-slate-700">{getItemPriceDisplay(item)}</span>,
                },
                {
                    key: "trackInventory",
                    header: "Bestand",
                    render: (item) =>
                        item.trackInventory ? (
                            <span className="admin-badge admin-badge-green">Aktiv</span>
                        ) : (
                            <span className="admin-badge admin-badge-neutral">Aus</span>
                        ),
                },
                {
                    key: "totalStock",
                    header: "Menge",
                    render: (item) =>
                        item.trackInventory ? (
                            <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                    item.totalStock <= 1
                                        ? "border-red-200 bg-red-50 text-red-700"
                                        : "border-slate-200 bg-slate-100 text-slate-700"
                                }`}
                            >
                                {item.totalStock} Stück
                            </span>
                        ) : (
                            <span className="text-slate-400">-</span>
                        ),
                },
                {
                    key: "status",
                    header: "Status",
                    render: (item) =>
                        item.published ? (
                            <span className="admin-badge admin-badge-green">Published</span>
                        ) : (
                            <span className="admin-badge admin-badge-neutral">Draft</span>
                        ),
                },
            ]}
            renderActions={(item) => (
                <div className="flex items-center gap-3">
                    <Link href={`/admin/items/${item.id}/edit`}>
                        <AdminButton variant="secondary" size="sm">
                            Bearbeiten
                        </AdminButton>
                    </Link>
                    <AdminButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.title)}
                    >
                        Löschen
                    </AdminButton>
                </div>
            )}
            onReorder={async (orderedIds) => {
                const res = await fetch("/api/admin/items/reorder", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderedIds }),
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data?.error ?? "Reorder failed");
                }

                return data.items;
            }}
        />
    );
}
