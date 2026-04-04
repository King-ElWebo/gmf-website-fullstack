"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";

type CatalogTypeData = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    categoryCount?: number;
};

export default function CatalogTypeForm({
    mode,
    catalogType,
}: {
    mode: "create" | "edit";
    catalogType?: CatalogTypeData;
}) {
    const router = useRouter();
    const [name, setName] = useState(catalogType?.name ?? "");
    const [slugManual, setSlugManual] = useState(catalogType?.slug ?? "");
    const [slugTouched, setSlugTouched] = useState(mode === "edit");
    const [description, setDescription] = useState(catalogType?.description ?? "");
    const [sortOrder, setSortOrder] = useState(String(catalogType?.sortOrder ?? 0));
    const [isActive, setIsActive] = useState(catalogType?.isActive ?? true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const slug = useMemo(() => (slugTouched ? slugManual : slugify(name)), [name, slugManual, slugTouched]);
    const canSave = name.trim().length > 0 && slug.trim().length > 0;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSave) return;

        setSaving(true);
        setError(null);

        const payload = {
            name,
            slug,
            description,
            sortOrder: sortOrder.trim() === "" ? 0 : Number(sortOrder),
            isActive,
        };

        const res = await fetch(mode === "create" ? "/api/admin/catalog-types" : `/api/admin/catalog-types/${catalogType?.id}`, {
            method: mode === "create" ? "POST" : "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setSaving(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error ?? (mode === "create" ? "Create failed" : "Update failed"));
            return;
        }

        router.push("/admin/catalog-types");
        router.refresh();
    }

    async function onDelete() {
        if (mode !== "edit" || !catalogType) return;
        if (!confirm("Delete this catalog type?")) return;

        setDeleting(true);
        setError(null);

        const res = await fetch(`/api/admin/catalog-types/${catalogType.id}`, { method: "DELETE" });

        setDeleting(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error ?? "Delete failed");
            return;
        }

        router.push("/admin/catalog-types");
        router.refresh();
    }

    return (
        <div className="max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">{mode === "create" ? "New Catalog Type" : "Edit Catalog Type"}</h1>

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
                    <p className="text-xs text-neutral-600">Used as a stable key for filtering and integrations.</p>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Beschreibung</label>
                    <textarea
                        className="min-h-[100px] w-full resize-y rounded-md border px-3 py-2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optionale Beschreibung dieses Katalogtyps..."
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Sortierung</label>
                    <input
                        type="number"
                        className="w-full rounded-md border px-3 py-2"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        step={1}
                    />
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    Aktiv
                </label>

                {mode === "edit" && typeof catalogType?.categoryCount === "number" && (
                    <div className="rounded-md border bg-neutral-50 p-3 text-sm text-neutral-700">
                        Zugeordnete Kategorien: {catalogType.categoryCount}
                    </div>
                )}

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
        </div>
    );
}
