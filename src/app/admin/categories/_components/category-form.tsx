"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { slugify } from "@/lib/slug";
import { clientOptimizeImage } from "@/lib/images/client-optimize";
import { AdminCard } from "../../_components/ui/AdminCard";
import { AdminField, AdminInput, AdminTextarea, AdminSelect } from "../../_components/ui/AdminInputs";
import { AdminButton } from "../../_components/ui/AdminButton";

type CatalogTypeOption = {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
};

type CategoryFormData = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    imageKey: string | null;
    catalogTypeId: string;
};

type CategoryFormProps = {
    mode: "create" | "edit";
    category?: CategoryFormData;
    catalogTypes: CatalogTypeOption[];
};

export default function CategoryForm({ mode, category, catalogTypes }: CategoryFormProps) {
    const router = useRouter();
    const [name, setName] = useState(category?.name ?? "");
    const [slugManual, setSlugManual] = useState(category?.slug ?? "");
    const [slugTouched, setSlugTouched] = useState(mode === "edit");
    const [description, setDescription] = useState(category?.description ?? "");
    const [catalogTypeId, setCatalogTypeId] = useState(category?.catalogTypeId ?? (catalogTypes[0]?.id ?? ""));
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(category?.imageUrl ?? null);
    const [removeImage, setRemoveImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const slug = useMemo(() => (slugTouched ? slugManual : slugify(name)), [name, slugManual, slugTouched]);
    const canSave = name.trim().length > 0 && slug.trim().length > 0 && catalogTypeId.trim().length > 0;
    const currentCatalogTypeId = category?.catalogTypeId ?? "";

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        setRemoveImage(false);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    }

    function handleRemoveImage() {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSave) return;

        setSaving(true);
        setError(null);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("slug", slug);
        formData.append("catalogTypeId", catalogTypeId);
        formData.append("description", description);
        if (mode === "edit") {
            formData.append("removeImage", removeImage ? "true" : "false");
        }
        if (imageFile) {
            const optimized = await clientOptimizeImage(imageFile);
            formData.append("image", optimized);
        }

        const res = await fetch(mode === "create" ? "/api/admin/categories" : `/api/admin/categories/${category?.id}`, {
            method: mode === "create" ? "POST" : "PATCH",
            body: formData,
        });

        setSaving(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error ?? (mode === "create" ? "Create failed" : "Update failed"));
            return;
        }

        router.push("/admin/categories");
        router.refresh();
    }

    async function onDelete() {
        if (mode !== "edit" || !category) return;
        if (!confirm("Delete this category?")) return;

        setDeleting(true);
        setError(null);

        const res = await fetch(`/api/admin/categories/${category.id}`, {
            method: "DELETE",
        });

        setDeleting(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error ?? "Delete failed");
            return;
        }

        router.push("/admin/categories");
        router.refresh();
    }

    return (
        <div className="max-w-5xl space-y-6">
            <h1 className="text-2xl font-semibold text-slate-900">{mode === "create" ? "New Category" : "Edit Category"}</h1>

            {catalogTypes.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    You need at least one active catalog type before creating categories.
                </div>
            ) : (
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                        {/* Left Column */}
                        <AdminCard title="General Information" description="Basic details about this category.">
                            <div className="space-y-5">
                                <AdminField label="Name *" htmlFor="name">
                                    <AdminInput
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </AdminField>

                                <AdminField label="Slug" htmlFor="slug" helperText="Auto-generated from the name, but editable.">
                                    <AdminInput
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => {
                                            setSlugTouched(true);
                                            setSlugManual(e.target.value);
                                        }}
                                    />
                                </AdminField>

                                <AdminField label="Catalog Type *" htmlFor="catalogType" helperText="Catalog types are managed separately and keep the category system generic.">
                                    <AdminSelect
                                        id="catalogType"
                                        value={catalogTypeId}
                                        onChange={(e) => setCatalogTypeId(e.target.value)}
                                    >
                                        {catalogTypes.map((type) => (
                                            <option
                                                key={type.id}
                                                value={type.id}
                                                disabled={!type.isActive && type.id !== currentCatalogTypeId}
                                            >
                                                {type.name} ({type.slug})
                                                {!type.isActive ? " - inactive" : ""}
                                            </option>
                                        ))}
                                    </AdminSelect>
                                </AdminField>

                                <AdminField label="Beschreibung" htmlFor="description">
                                    <AdminTextarea
                                        id="description"
                                        rows={6}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optionale Beschreibung der Kategorie..."
                                    />
                                </AdminField>
                            </div>
                        </AdminCard>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <AdminCard title="Media" description="A picture speaks a thousand words.">
                                <div className="space-y-5">
                                    {imagePreview && !removeImage && (
                                        <div className="space-y-3 mb-6">
                                            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Aktuelles Bild</label>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-48 w-48 rounded-xl border border-slate-200 object-cover bg-slate-50"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="block text-sm text-red-600 hover:text-red-800 transition-colors font-medium"
                                            >
                                                Bild entfernen
                                            </button>
                                        </div>
                                    )}

                                    <AdminField label={imagePreview && !removeImage ? "Bild austauschen (optional)" : "Titelbild (optional)"} htmlFor="image">
                                        <input
                                            id="image"
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                        />
                                    </AdminField>
                                </div>
                            </AdminCard>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex items-center gap-3">
                        <AdminButton type="submit" disabled={saving || !canSave}>
                            {saving ? "Speichert..." : mode === "create" ? "Erstellen" : "Speichern"}
                        </AdminButton>

                        {mode === "edit" && (
                            <AdminButton
                                type="button"
                                variant="danger"
                                onClick={onDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Löscht..." : "Löschen"}
                            </AdminButton>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}
