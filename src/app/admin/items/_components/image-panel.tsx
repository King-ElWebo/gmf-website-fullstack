"use client";

import { useState, useCallback } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    arrayMove,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ImageRow = {
    id: string;
    url: string;
    key: string;
    alt: string | null;
    sortOrder: number;
};

// ── Single sortable image card ──────────────────────────────────────────────

function SortableImage({
    image,
    isCover,
    onCover,
    onDelete,
    isDeleting,
}: {
    image: ImageRow;
    isCover: boolean;
    onCover: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: image.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50"
        >
            {/* Drag handle overlays the image — separate from buttons */}
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={image.url}
                    alt={image.alt ?? ""}
                    className="w-full h-36 object-cover"
                    draggable={false}
                />
            </div>

            {/* Cover badge */}
            {isCover && (
                <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Cover
                </span>
            )}

            {/* Action buttons — always visible, outside drag area */}
            <div className="flex border-t border-neutral-200">
                {!isCover && (
                    <button
                        type="button"
                        onClick={onCover}
                        className="flex-1 text-xs py-2 text-neutral-600 hover:bg-yellow-50 hover:text-yellow-700 transition-colors border-r border-neutral-200"
                        title="Als Cover setzen"
                    >
                        ★ Cover
                    </button>
                )}
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="flex-1 text-xs py-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Bild löschen"
                >
                    {isDeleting ? "Löscht…" : "✕ Löschen"}
                </button>
            </div>
        </div>
    );
}

// ── ImagePanel ───────────────────────────────────────────────────────────────

export default function ImagePanel({
    itemId,
    initialImages,
}: {
    itemId: string;
    initialImages: ImageRow[];
}) {
    const [images, setImages] = useState<ImageRow[]>(
        [...initialImages].sort((a, b) => a.sortOrder - b.sortOrder)
    );
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Require 8px drag distance before activating — prevents accidental drags on clicks
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    // ── Upload ───────────────────────────────────────────────────────────────

    const handleUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const fileList = e.target.files;
            if (!fileList || fileList.length === 0) return;
            const files = Array.from(fileList);
            e.target.value = "";

            setUploading(true);
            setError(null);

            const fd = new FormData();
            for (const file of files) fd.append("files", file);

            const res = await fetch(`/api/admin/items/${itemId}/images`, {
                method: "POST",
                body: fd,
            });

            setUploading(false);

            if (!res.ok) {
                setError("Upload fehlgeschlagen");
                return;
            }

            const data = (await res.json()) as { images: ImageRow[] };
            setImages(data.images);
        },
        [itemId]
    );

    // ── Drag end ─────────────────────────────────────────────────────────────

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = images.findIndex((img) => img.id === active.id);
            const newIndex = images.findIndex((img) => img.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(images, oldIndex, newIndex);
            setImages(reordered); // optimistic update

            const res = await fetch(`/api/admin/items/${itemId}/images/reorder`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderedIds: reordered.map((img) => img.id) }),
            });

            if (!res.ok) {
                setError("Reihenfolge konnte nicht gespeichert werden");
                setImages(images); // rollback
            } else {
                const data = (await res.json()) as { images: ImageRow[] };
                setImages(data.images);
            }
        },
        [images, itemId]
    );

    // ── Set cover ────────────────────────────────────────────────────────────

    const handleCover = useCallback(
        async (imageId: string) => {
            setError(null);
            const res = await fetch(
                `/api/admin/items/${itemId}/images/${imageId}/cover`,
                { method: "PATCH" }
            );

            if (!res.ok) {
                setError("Cover konnte nicht gesetzt werden");
                return;
            }

            const data = (await res.json()) as { images: ImageRow[] };
            setImages(data.images);
        },
        [itemId]
    );

    // ── Delete ───────────────────────────────────────────────────────────────

    const handleDelete = useCallback(
        async (imageId: string) => {
            if (!confirm("Bild wirklich löschen?")) return;

            setDeletingId(imageId);
            setError(null);

            const res = await fetch(
                `/api/admin/items/${itemId}/images/${imageId}`,
                { method: "DELETE" }
            );

            setDeletingId(null);

            if (!res.ok) {
                setError("Bild konnte nicht gelöscht werden");
                return;
            }

            setImages((prev) => prev.filter((img) => img.id !== imageId));
        },
        [itemId]
    );

    // ── Render ───────────────────────────────────────────────────────────────

    const coverId = images[0]?.id ?? null;

    return (
        <div className="space-y-3 pt-4 border-t mt-6">
            <h2 className="text-base font-semibold">Bilder</h2>

            {/* Upload row */}
            <div className="flex items-center gap-2">
                <label className="rounded-md border px-3 py-1.5 text-sm cursor-pointer hover:bg-neutral-50">
                    {uploading ? "Hochlädt…" : "Bilder wählen…"}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploading}
                        onChange={handleUpload}
                        className="sr-only"
                    />
                </label>
                <span className="text-xs text-neutral-500">
                    Mehrere Bilder gleichzeitig möglich. Drag &amp; Drop zum Sortieren.
                </span>
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {images.length === 0 && (
                <p className="text-sm text-neutral-400">Noch keine Bilder.</p>
            )}

            {/* Sortable grid */}
            {images.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={images.map((img) => img.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {images.map((img) => (
                                <SortableImage
                                    key={img.id}
                                    image={img}
                                    isCover={img.id === coverId}
                                    onCover={() => handleCover(img.id)}
                                    onDelete={() => handleDelete(img.id)}
                                    isDeleting={deletingId === img.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
