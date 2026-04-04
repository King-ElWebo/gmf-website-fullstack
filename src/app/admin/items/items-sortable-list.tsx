"use client";

import Link from "next/link";
import { getItemPriceDisplay } from "@/lib/items/price";
import SortableRowList from "../_components/sortable-row-list";

type ItemRow = {
    id: string;
    title: string;
    slug: string;
    priceType: "FIXED" | "ON_REQUEST" | "FROM_PRICE";
    basePriceCents: number | null;
    priceLabel: string | null;
    published: boolean;
    category: {
        name: string | null;
        catalogType?: {
            name: string;
        } | null;
    } | null;
};

export default function ItemsSortableList({ initialItems }: { initialItems: ItemRow[] }) {
    return (
        <SortableRowList
            items={initialItems}
            emptyText="No items yet."
            columns={[
                {
                    key: "title",
                    header: "Title",
                    render: (item) => <div className="font-semibold text-slate-900">{item.title}</div>,
                },
                {
                    key: "slug",
                    header: "Slug",
                    render: (item) => <span className="text-slate-500">{item.slug}</span>,
                },
                {
                    key: "category",
                    header: "Category",
                    render: (item) => (
                        <div>
                            <div className="font-medium text-slate-700">{item.category?.name || "None"}</div>
                            {item.category?.catalogType?.name && (
                                <div className="text-xs text-slate-400">{item.category.catalogType.name}</div>
                            )}
                        </div>
                    ),
                },
                {
                    key: "price",
                    header: "Price",
                    render: (item) => <span className="font-medium text-slate-700">{getItemPriceDisplay(item)}</span>,
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
                <Link className="font-medium text-blue-600 hover:text-blue-800" href={`/admin/items/${item.id}/edit`}>
                    Edit
                </Link>
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
