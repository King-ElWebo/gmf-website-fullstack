"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton } from "../../_components/ui/AdminButton";
import { AdminCard } from "../../_components/ui/AdminCard";
import { AdminField, AdminInput, AdminTextarea, AdminCheckbox } from "../../_components/ui/AdminInputs";
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

            <AdminCard title="Allgemeine Einstellungen">
                <div className="grid gap-5 md:grid-cols-2">
                    <AdminField label="Interner Name" helperText="Nur für dich im Admin sichtbar.">
                        <AdminInput
                            type="text"
                            required
                            value={formData.internalName}
                            onChange={(e) => setFormData({ ...formData, internalName: e.target.value })}
                            placeholder="z.B. Hüpfburg Standard"
                        />
                    </AdminField>

                    <AdminField label="Anzeige-Titel (Überschrift)" helperText="Wird für den Bereich über den Blöcken angezeigt.">
                        <AdminInput
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </AdminField>
                </div>

                <div className="mt-6">
                    <AdminCheckbox
                        label="Vorlage aktivieren"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                </div>
            </AdminCard>

            <AdminCard
                title="Hinweis-Blöcke (Maximal 4)"
                headerAction={
                    formData.blocks.length < 4 && (
                        <AdminButton
                            type="button"
                            onClick={addBlock}
                            variant="secondary"
                            className="h-8 gap-1 px-3 text-xs"
                        >
                            <Plus size={14} />
                            Block hinzufügen
                        </AdminButton>
                    )
                }
            >

                <div className="space-y-4">
                    {formData.blocks.length === 0 ? (
                        <div className="rounded-[16px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                            Noch keine Blöcke vorhanden.
                        </div>
                    ) : (
                        formData.blocks.map((block, index) => (
                            <div key={index} className="relative rounded-[20px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
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
                                    <AdminField label="Label (Links)">
                                        <AdminInput
                                            type="text"
                                            required
                                            value={block.highlightLabel}
                                            onChange={(e) => updateBlock(index, "highlightLabel", e.target.value)}
                                            placeholder="z.B. OK, 230V, !"
                                        />
                                    </AdminField>
                                    <AdminField label="Überschrift">
                                        <AdminInput
                                            type="text"
                                            required
                                            value={block.heading}
                                            onChange={(e) => updateBlock(index, "heading", e.target.value)}
                                            placeholder="z.B. Zubehör inklusive"
                                        />
                                    </AdminField>
                                    <AdminField label="Fließtext" className="md:col-span-2">
                                        <AdminTextarea
                                            required
                                            value={block.body}
                                            onChange={(e) => updateBlock(index, "body", e.target.value)}
                                            placeholder="Beschreibung..."
                                            rows={2}
                                        />
                                    </AdminField>
                                </div>
                                
                                <div className="mt-4 border-t border-slate-200 pt-4">
                                    <AdminCheckbox
                                        label="Block aktiv"
                                        checked={block.isActive}
                                        onChange={(e) => updateBlock(index, "isActive", e.target.checked)}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </AdminCard>

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
