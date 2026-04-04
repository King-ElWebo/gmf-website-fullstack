"use client";

import Link from "next/link";
import SortableRowList from "../_components/sortable-row-list";

type GlobalImageRow = {
    id: string;
    url: string;
    alt: string | null;
    area: string;
    published: boolean;
};

export default function ImagesSortableList({ initialImages }: { initialImages: GlobalImageRow[] }) {
    return (
        <SortableRowList
            items={initialImages}
            emptyText="Noch keine Bilder hochgeladen."
            columns={[
                {
                    key: "preview",
                    header: "Vorschau",
                    render: (image) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image.url}
                            alt={image.alt ?? ""}
                            className="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-sm"
                        />
                    ),
                },
                {
                    key: "area",
                    header: "Bereich",
                    render: (image) => <span className="admin-badge admin-badge-blue">{image.area}</span>,
                },
                {
                    key: "alt",
                    header: "Alt-Text",
                    render: (image) => <span className="max-w-xs truncate text-slate-500">{image.alt || "-"}</span>,
                },
                {
                    key: "status",
                    header: "Status",
                    render: (image) =>
                        image.published ? (
                            <span className="admin-badge admin-badge-green">Online</span>
                        ) : (
                            <span className="admin-badge admin-badge-neutral">Offline</span>
                        ),
                },
            ]}
            renderActions={(image) => (
                <Link className="font-medium text-blue-600 hover:text-blue-800" href={`/admin/images/${image.id}/edit`}>
                    Bearbeiten
                </Link>
            )}
            onReorder={async (orderedIds) => {
                const res = await fetch("/api/admin/images/reorder", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderedIds }),
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data?.error ?? "Reorder failed");
                }

                return data.images;
            }}
        />
    );
}
