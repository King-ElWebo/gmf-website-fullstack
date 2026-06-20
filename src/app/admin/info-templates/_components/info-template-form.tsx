"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton } from "../../_components/ui/AdminButton";
import { GripVertical, Plus, Trash2 } from "lucide-react";

export type InfoTemplateBlockData = {
    id?: string;
    highlightLabel: string;
    heading: string;
    body: string;
    sortOrder: number;
    isActive: boolean;
};

export type InfoTemplateData = {
    id?: string;
    internalName: string;
    title: string;
    isActive: boolean;
    blocks: InfoTemplateBlockData[];
};

export function InfoTemplateForm({
    initialData,
}: {
    initialData?: InfoTemplateData;
}) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<InfoTemplateData>(
        initialData || {
            internalName: "",
            title: "Wichtige Infos & Inklusivleistungen",
            isActive: true,
            blocks: [],
        }
    );

    const isNew = !formData.id;

    const addBlock = () => {
        if (formData.blocks.length >= 4) return;
        setFormData((prev) => ({
            ...prev,
            blocks: [
                ...prev.blocks,
                {
                    highlightLabel: "OK",
                    heading: "",
                    body: "",
                    sortOrder: prev.blocks.length + 1,
                    isActive: true,
                },
            ],
        }));
    };

    const removeBlock = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            blocks: prev.blocks.filter((_, i) => i !== index).map((b, i) => ({ ...b, sortOrder: i + 1 })),
        }));
    };

    const updateBlock = (index: number, key: keyof InfoTemplateBlockData, value: any) => {
        setFormData((prev) => {
            const newBlocks = [...prev.blocks];
            newBlocks[index] = { ...newBlocks[index], [key]: value };
            return { ...prev, blocks: newBlocks };
        });
    };

    const moveBlock = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === formData.blocks.length - 1) return;

        setFormData((prev) => {
            const newBlocks = [...prev.blocks];
            const swapIndex = direction === "up" ? index - 1 : index + 1;
            const temp = newBlocks[index];
            newBlocks[index] = newBlocks[swapIndex];
            newBlocks[swapIndex] = temp;
            
            // update sort orders
            newBlocks.forEach((b, i) => (b.sortOrder = i + 1));
            return { ...prev, blocks: newBlocks };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const url = isNew ? "/api/admin/info-templates" : `/api/admin/info-templates/${formData.id}`;
            const method = isNew ? "POST" : "PATCH";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Ein Fehler ist aufgetreten.");
            }

            router.push("/admin/info-templates");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.id || !window.confirm("Vorlage wirklich löschen?")) return;
        
        setIsDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/info-templates/${formData.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Fehler beim Löschen.");
            }

            router.push("/admin/info-templates");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="rounded-[16px] bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="space-y-5 rounded-[26px] border border-[#e2e8f0] bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-slate-800">Allgemeine Einstellungen</h2>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Interner Name</label>
                        <input
                            type="text"
                            required
                            value={formData.internalName}
                            onChange={(e) => setFormData({ ...formData, internalName: e.target.value })}
                            className="admin-input"
                            placeholder="z.B. Hüpfburg Standard"
                        />
                        <p className="mt-1 text-xs text-slate-500">Nur für dich im Admin sichtbar.</p>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Anzeige-Titel (Überschrift)</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="admin-input"
                        />
                        <p className="mt-1 text-xs text-slate-500">Wird für den Bereich über den Blöcken angezeigt.</p>
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Vorlage aktivieren
                    </label>
                </div>
            </div>

            <div className="space-y-5 rounded-[26px] border border-[#e2e8f0] bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-800">Hinweis-Blöcke (Maximal 4)</h2>
                    {formData.blocks.length < 4 && (
                        <button
                            type="button"
                            onClick={addBlock}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                        >
                            <Plus size={14} />
                            Block hinzufügen
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {formData.blocks.length === 0 ? (
                        <div className="rounded-[16px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                            Noch keine Blöcke vorhanden.
                        </div>
                    ) : (
                        formData.blocks.map((block, index) => (
                            <div key={index} className="relative rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="absolute right-4 top-4 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => moveBlock(index, "up")}
                                        disabled={index === 0}
                                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveBlock(index, "down")}
                                        disabled={index === formData.blocks.length - 1}
                                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeBlock(index)}
                                        className="ml-2 text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="mb-4 text-xs font-semibold uppercase text-slate-400">Block {index + 1}</div>

                                <div className="grid gap-4 md:grid-cols-[100px_1fr]">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-700">Label (Links)</label>
                                        <input
                                            type="text"
                                            required
                                            value={block.highlightLabel}
                                            onChange={(e) => updateBlock(index, "highlightLabel", e.target.value)}
                                            className="admin-input py-1.5 text-sm"
                                            placeholder="z.B. OK, 230V, !"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-700">Überschrift</label>
                                        <input
                                            type="text"
                                            required
                                            value={block.heading}
                                            onChange={(e) => updateBlock(index, "heading", e.target.value)}
                                            className="admin-input py-1.5 text-sm"
                                            placeholder="z.B. Zubehör inklusive"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 block text-xs font-medium text-slate-700">Fließtext</label>
                                        <textarea
                                            required
                                            value={block.body}
                                            onChange={(e) => updateBlock(index, "body", e.target.value)}
                                            className="admin-input min-h-[60px] py-1.5 text-sm"
                                            placeholder="Beschreibung..."
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4 border-t border-slate-100 pt-3">
                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={block.isActive}
                                            onChange={(e) => updateBlock(index, "isActive", e.target.checked)}
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        Block aktiv
                                    </label>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                {!isNew ? (
                    <AdminButton
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        disabled={isSaving || isDeleting}
                    >
                        {isDeleting ? "Löscht..." : "Vorlage löschen"}
                    </AdminButton>
                ) : (
                    <div />
                )}

                <div className="flex gap-3">
                    <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={() => router.push("/admin/info-templates")}
                        disabled={isSaving || isDeleting}
                    >
                        Abbrechen
                    </AdminButton>
                    <AdminButton type="submit" variant="primary" disabled={isSaving || isDeleting}>
                        {isSaving ? "Speichert..." : "Vorlage speichern"}
                    </AdminButton>
                </div>
            </div>
        </form>
    );
}
