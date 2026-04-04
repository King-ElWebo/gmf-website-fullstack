"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { slugify } from "@/lib/slug";

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
        if (imageFile) formData.append("image", imageFile);

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
        <div className="max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">{mode === "create" ? "New Category" : "Edit Category"}</h1>

            {catalogTypes.length === 0 ? (
                <div className="rounded-md border p-4 text-sm text-neutral-700">
                    You need at least one active catalog type before creating categories.
                </div>
            ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full rounded-md border px-3 py-2"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Slug</label>
                        <input
                            className="w-full rounded-md border px-3 py-2"
                            value={slug}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setSlugManual(e.target.value);
                            }}
                        />
                        <p className="text-xs text-neutral-600">Auto-generated from the name, but editable.</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Catalog Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full rounded-md border px-3 py-2"
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
                        </select>
                        <p className="text-xs text-neutral-600">
                            Catalog types are managed separately and keep the category system generic.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Beschreibung</label>
                        <textarea
                            className="min-h-[100px] w-full resize-y rounded-md border px-3 py-2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optionale Beschreibung der Kategorie..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Titelbild (optional)</label>
                        {imagePreview ? (
                            <div className="relative w-full max-w-xs">
                                <Image
                                    src={imagePreview}
                                    alt="Vorschau"
                                    width={320}
                                    height={180}
                                    className="h-44 w-full rounded-md border object-cover"
                                    unoptimized={imagePreview.startsWith("blob:")}
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black"
                                >
                                    x
                                </button>
                            </div>
                        ) : (
                            <div
                                className="flex h-36 w-full max-w-xs cursor-pointer items-center justify-center rounded-md border-2 border-dashed transition-colors hover:bg-neutral-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <span className="text-sm text-neutral-500">Bild auswählen</span>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-neutral-700 underline"
                        >
                            {imagePreview ? "Bild ersetzen" : "Bild hochladen"}
                        </button>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-2">
                        <button
                            disabled={saving || !canSave}
                            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                        >
                            {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
                        </button>

                        {mode === "edit" && (
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={deleting}
                                className="rounded-md border px-4 py-2 text-sm disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}
