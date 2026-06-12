"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SortableRowList from "../_components/sortable-row-list";

type GlobalImageRow = {
    id: string;
    url: string;
    alt: string | null;
    area: string;
    published: boolean;
};

export default function ImagesSortableList({ initialImages }: { initialImages: GlobalImageRow[] }) {
    const router = useRouter();

    const handleDelete = async (id: string, alt: string | null) => {
        const identifier = alt ? `"${alt}"` : "dieses Bild";
        if (!window.confirm(`Möchten Sie ${identifier} wirklich löschen?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/images/${id}`, {
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
                <div className="flex items-center gap-3">
                    <Link className="font-medium text-blue-600 hover:text-blue-800" href={`/admin/images/${image.id}/edit`}>
                        Bearbeiten
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDelete(image.id, image.alt)}
                        className="font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                        Löschen
                    </button>
                </div>
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
