"use client";

import { useCallback, useState } from "react";
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type ImageRow = {
    id: string;
    url: string;
    key: string;
    alt: string | null;
    sortOrder: number;
    type?: "IMAGE" | "VIDEO";
    file?: File;
};

function normalizeImageOrder(images: ImageRow[]) {
    return images.map((image, index) => ({
        ...image,
        sortOrder: index,
    }));
}

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
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                {image.type === "VIDEO" ? (
                    <video src={image.url} className="h-36 w-full object-cover" controls={false} autoPlay={false} />
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt={image.alt ?? ""} className="h-36 w-full object-cover" draggable={false} />
                )}
            </div>

            {isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                    Cover
                </span>
            )}

            {image.type === "VIDEO" && (
                <span className="absolute right-2 top-2 hidden rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white sm:block">
                    Video
                </span>
            )}

            <div className="flex border-t border-neutral-200">
                {!isCover && (
                    <button
                        type="button"
                        onClick={onCover}
                        className="flex-1 border-r border-neutral-200 py-2 text-xs text-neutral-600 transition-colors hover:bg-yellow-50 hover:text-yellow-700"
                        title="Als Cover setzen"
                    >
                        Cover
                    </button>
                )}
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Bild löschen"
                >
                    {isDeleting ? "Löscht..." : "Löschen"}
                </button>
            </div>
        </div>
    );
}

export default function ImagePanel({
    itemId,
    initialImages,
    onChangeLocal,
}: {
    itemId?: string;
    initialImages: ImageRow[];
    onChangeLocal?: (images: ImageRow[]) => void;
}) {
    const [images, setImages] = useState<ImageRow[]>(normalizeImageOrder([...initialImages].sort((a, b) => a.sortOrder - b.sortOrder)));
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // No more manual useEffect sync to avoid loops.
    // Instead, we rely on the component being re-mounted or using initial state.
    // The itemId check is kept to distinguish between edit and create modes.

    const updateImages = useCallback((newImages: ImageRow[]) => {
        setImages(newImages);
        if (onChangeLocal) {
            onChangeLocal(newImages);
        }
    }, [onChangeLocal]);

    const handleUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const fileList = e.target.files;
            if (!fileList || fileList.length === 0) return;

            const files = Array.from(fileList);
            e.target.value = "";

            if (!itemId) {
                const newLocal = files.map((file) => ({
                    id: `local-${Math.random().toString(36).slice(2)}`,
                    url: URL.createObjectURL(file),
                    file,
                    key: "",
                    alt: null,
                    sortOrder: 0,
                    type: file.type.startsWith("video/") ? ("VIDEO" as const) : ("IMAGE" as const),
                }));

                updateImages(normalizeImageOrder([...images, ...newLocal]));
                return;
            }

            setUploading(true);
            setError(null);

            const fd = new FormData();
            for (const file of files) {
                fd.append("files", file);
            }

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
            updateImages(normalizeImageOrder(data.images));
        },
        [itemId, images, updateImages]
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = images.findIndex((image) => image.id === active.id);
            const newIndex = images.findIndex((image) => image.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = normalizeImageOrder(arrayMove(images, oldIndex, newIndex));

            if (!itemId) {
                updateImages(reordered);
                return;
            }

            const previous = images;
            updateImages(reordered);

            const res = await fetch(`/api/admin/items/${itemId}/images/reorder`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderedIds: reordered.map((image) => image.id) }),
            });

            if (!res.ok) {
                setError("Reihenfolge konnte nicht gespeichert werden");
                updateImages(previous);
                return;
            }

            const data = (await res.json()) as { images: ImageRow[] };
            updateImages(normalizeImageOrder(data.images));
        },
        [images, itemId, updateImages]
    );

    const handleCover = useCallback(
        async (imageId: string) => {
            if (!itemId) {
                const index = images.findIndex((image) => image.id === imageId);
                if (index === -1) return;
                updateImages(normalizeImageOrder([images[index], ...images.filter((image) => image.id !== imageId)]));
                return;
            }

            setError(null);
            const res = await fetch(`/api/admin/items/${itemId}/images/${imageId}/cover`, { method: "PATCH" });

            if (!res.ok) {
                setError("Cover konnte nicht gesetzt werden");
                return;
            }

            const data = (await res.json()) as { images: ImageRow[] };
            updateImages(normalizeImageOrder(data.images));
        },
        [images, itemId, updateImages]
    );

    const handleDelete = useCallback(
        async (imageId: string) => {
            if (!confirm("Bild wirklich löschen?")) return;

            if (!itemId) {
                updateImages(normalizeImageOrder(images.filter((image) => image.id !== imageId)));
                return;
            }

            setDeletingId(imageId);
            setError(null);

            const res = await fetch(`/api/admin/items/${itemId}/images/${imageId}`, { method: "DELETE" });

            setDeletingId(null);

            if (!res.ok) {
                setError("Bild konnte nicht gelöscht werden");
                return;
            }

            const data = (await res.json()) as { images: ImageRow[] };
            updateImages(normalizeImageOrder(data.images));
        },
        [images, itemId, updateImages]
    );

    const coverId = images[0]?.id ?? null;

    return (
        <div className="mt-6 space-y-3 border-t pt-4">
            <h2 className="text-base font-semibold">Bilder</h2>

            <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50">
                    {uploading ? "Lädt hoch..." : "Bilder wählen..."}
                    <input
                        type="file"
                        accept="image/*,video/mp4,video/webm,video/ogg"
                        multiple
                        disabled={uploading}
                        onChange={handleUpload}
                        className="sr-only"
                    />
                </label>
                <span className="text-xs text-neutral-500">Mehrere Bilder gleichzeitig möglich. Drag-and-drop zum Sortieren.</span>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {images.length === 0 && <p className="text-sm text-neutral-400">Noch keine Bilder.</p>}

            {images.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map((image) => image.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {images.map((image) => (
                                <SortableImage
                                    key={image.id}
                                    image={image}
                                    isCover={image.id === coverId}
                                    onCover={() => handleCover(image.id)}
                                    onDelete={() => handleDelete(image.id)}
                                    isDeleting={deletingId === image.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
