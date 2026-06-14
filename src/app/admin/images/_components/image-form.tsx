"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DisplayArea } from "@/lib/display-area";
import { clientOptimizeImage } from "@/lib/images/client-optimize";
import { AdminCard } from "../../_components/ui/AdminCard";
import { AdminField, AdminInput, AdminCheckbox } from "../../_components/ui/AdminInputs";
import { AdminButton } from "../../_components/ui/AdminButton";

type ImageFormProps = {
    mode: "create" | "edit";
    initialData?: {
        id: string;
        url: string;
        alt: string | null;
        area: DisplayArea;
        published: boolean;
    };
};

export default function ImageForm({ mode, initialData }: ImageFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const [files, setFiles] = useState<FileList | null>(null);
    const [alt, setAlt] = useState(initialData?.alt ?? "");
    const [area, setArea] = useState<DisplayArea>(initialData?.area ?? DisplayArea.OTHER);
    const [published, setPublished] = useState(initialData?.published ?? true);

    const handleDelete = async () => {
        if (!initialData?.id) return;
        if (!confirm("Möchtest du dieses Bild wirklich löschen?")) return;

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
            setError(err instanceof Error ? err.message : "Delete failed");
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
                for (let i = 0; i < files.length; i += 1) {
                    const optimized = await clientOptimizeImage(files[i]);
                    fd.append("files", optimized);
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

                let res: Response;

                if (files && files.length > 0) {
                    const fd = new FormData();
                    const optimized = await clientOptimizeImage(files[0]);
                    fd.append("file", optimized);
                    fd.append("alt", alt);
                    fd.append("area", area);
                    fd.append("published", published.toString());

                    res = await fetch(`/api/admin/images/${initialData.id}`, {
                        method: "PATCH",
                        body: fd,
                    });
                } else {
                    res = await fetch(`/api/admin/images/${initialData.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ alt, area, published }),
                    });
                }

                if (!res.ok) throw new Error("Fehler beim Speichern");
            }

            router.push("/admin/images");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-semibold text-slate-900">
                {mode === "create" ? "Neues Bild hochladen" : "Bild bearbeiten"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <AdminCard title="Bilddatei">
                    {mode === "edit" && initialData?.url && (
                        <div className="space-y-3 mb-6">
                            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Aktuelles Bild</label>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={initialData.url}
                                alt="Preview"
                                className="h-48 w-48 rounded-xl border border-slate-200 object-cover bg-slate-50"
                            />
                        </div>
                    )}

                    <AdminField label={mode === "create" ? "Bilder *" : "Bild austauschen (optional)"} htmlFor="files">
                        <input
                            id="files"
                            type="file"
                            accept="image/*"
                            multiple={mode === "create"}
                            required={mode === "create"}
                            onChange={(e) => setFiles(e.target.files)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                        />
                    </AdminField>
                </AdminCard>

                <AdminCard title="Metadaten & Anzeige">
                    <div className="space-y-5">
                        <AdminField label="Anzeigebereich" htmlFor="area">
                            <select
                                id="area"
                                value={area}
                                onChange={(e) => setArea(e.target.value as DisplayArea)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                            >
                                <option value={DisplayArea.CAROUSEL}>Carousel</option>
                                <option value={DisplayArea.GALLERY}>Galerie</option>
                                <option value={DisplayArea.SOCIAL}>Social Media</option>
                                <option value={DisplayArea.OTHER}>Sonstige</option>
                            </select>
                        </AdminField>

                        <AdminField label="Alternativtext (Alt)" htmlFor="alt">
                            <AdminInput
                                id="alt"
                                value={alt}
                                onChange={(e) => setAlt(e.target.value)}
                            />
                        </AdminField>

                        <div className="pt-2 space-y-2">
                            <AdminCheckbox
                                label="Online (veröffentlicht)"
                                checked={published}
                                onChange={(e) => setPublished(e.target.checked)}
                            />
                            <p className="text-xs text-slate-500 ml-7">
                                Die Reihenfolge pflegst du in der Bilder-Übersicht per Drag-and-drop.
                            </p>
                        </div>
                    </div>
                </AdminCard>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div className="flex items-center gap-4">
                    <AdminButton
                        type="submit"
                        disabled={loading || deleting}
                    >
                        {loading ? "Speichert..." : "Speichern"}
                    </AdminButton>

                    {mode === "edit" && (
                        <AdminButton
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            disabled={loading || deleting}
                        >
                            {deleting ? "Löscht..." : "Bild löschen"}
                        </AdminButton>
                    )}
                </div>
            </form>
        </div>
    );
}
