"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DisplayArea } from "@prisma/client";

type ImageFormProps = {
    mode: "create" | "edit";
    initialData?: {
        id: string;
        url: string;
        alt: string | null;
        area: DisplayArea;
        published: boolean;
        sortOrder: number;
    };
};

export default function ImageForm({ mode, initialData }: ImageFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false); // NEU: State für's Löschen
    const [error, setError] = useState("");

    const [files, setFiles] = useState<FileList | null>(null);
    const [alt, setAlt] = useState(initialData?.alt ?? "");
    const [area, setArea] = useState<DisplayArea>(initialData?.area ?? DisplayArea.OTHER);
    const [published, setPublished] = useState(initialData?.published ?? true);
    const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);

    // --- NEU: Funktion zum Löschen ---
    const handleDelete = async () => {
        if (!initialData?.id) return;
        if (!confirm("Möchtest du dieses Bild wirklich unwiderruflich löschen?")) return;

        setDeleting(true);
        setError("");

        try {
            const res = await fetch(`/api/admin/images/${initialData.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Fehler beim Löschen");

            router.push("/admin/images");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten");
            setDeleting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (mode === "create") {
                if (!files || files.length === 0) {
                    throw new Error("Bitte wähle mindestens ein Bild aus.");
                }

                const fd = new FormData();
                for (let i = 0; i < files.length; i++) {
                    fd.append("files", files[i]);
                }
                fd.append("alt", alt);
                fd.append("area", area);
                fd.append("published", published.toString());

                const res = await fetch("/api/admin/images", {
                    method: "POST",
                    body: fd,
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    throw new Error(data?.error || "Fehler beim Upload");
                }
            } else {
                if (!initialData?.id) return;

                let res;
                // Wenn ein NEUES Bild im Edit-Modus ausgewählt wurde, als FormData senden
                if (files && files.length > 0) {
                    const fd = new FormData();
                    fd.append("file", files[0]);
                    fd.append("alt", alt);
                    fd.append("area", area);
                    fd.append("published", published.toString());
                    fd.append("sortOrder", sortOrder.toString());

                    res = await fetch(`/api/admin/images/${initialData.id}`, {
                        method: "PATCH",
                        body: fd,
                    });
                } else {
                    // Kein neues Bild, nur Texte/Status updaten (wie vorher)
                    res = await fetch(`/api/admin/images/${initialData.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ alt, area, published, sortOrder }),
                    });
                }

                if (!res.ok) throw new Error("Fehler beim Speichern");
            }

            router.push("/admin/images");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
            <h1 className="text-2xl font-semibold">
                {mode === "create" ? "Neues Bild hochladen" : "Bild bearbeiten"}
            </h1>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* Vorschau des ALTEN Bildes im Edit-Modus */}
            {mode === "edit" && initialData?.url && (
                <div className="space-y-1">
                    <label className="text-sm font-medium">Aktuelles Bild</label>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={initialData.url}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-md border"
                    />
                </div>
            )}

            {/* Datei-Upload ist jetzt IMMER sichtbar (für Create UND Edit zum Austauschen) */}
            <div className="space-y-1">
                <label className="text-sm font-medium">
                    {mode === "create" ? "Bilder *" : "Bild austauschen (optional)"}
                </label>
                <input
                    type="file"
                    accept="image/*"
                    multiple={mode === "create"}
                    required={mode === "create"}
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full rounded-md border p-2 text-sm"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Anzeigebereich</label>
                <select
                    value={area}
                    onChange={(e) => setArea(e.target.value as DisplayArea)}
                    className="w-full rounded-md border p-2 text-sm"
                >
                    <option value={DisplayArea.CAROUSEL}>Carousel</option>
                    <option value={DisplayArea.GALLERY}>Galerie</option>
                    <option value={DisplayArea.SOCIAL}>Social Media</option>
                    <option value={DisplayArea.OTHER}>Sonstige</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Alternativtext (Alt)</label>
                <input
                    type="text"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    className="w-full rounded-md border p-2 text-sm"
                />
            </div>

            {mode === "edit" && (
                <div className="space-y-1">
                    <label className="text-sm font-medium">Sortierreihenfolge</label>
                    <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        className="w-full rounded-md border p-2 text-sm"
                    />
                </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded text-black focus:ring-black"
                />
                <span className="text-sm">Online (veröffentlicht)</span>
            </label>

            {/* Buttons: Speichern und Löschen nebeneinander */}
            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={loading || deleting}
                    className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
                >
                    {loading ? "Speichert..." : "Speichern"}
                </button>

                {mode === "edit" && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading || deleting}
                        className="rounded-md bg-red-50 text-red-600 border border-red-200 px-4 py-2 text-sm hover:bg-red-100 disabled:opacity-50"
                    >
                        {deleting ? "Löscht..." : "Bild löschen"}
                    </button>
                )}
            </div>
        </form>
    );
}