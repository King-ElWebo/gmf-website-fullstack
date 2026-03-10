"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import ImagePanel from "./image-panel";

type CategoryOption = { id: string; name: string; slug: string };

type ImageRow = {
    id: string;
    url: string;
    key: string;
    alt: string | null;
    sortOrder: number;
};

type ItemFormState = {
    title: string;
    slug: string;
    description: string;
    priceCents: string; // im UI als string
    published: boolean;
    categoryId: string;
};

export default function ItemForm(props: {
    mode: "create" | "edit";
    itemId?: string;
    categories: CategoryOption[];
    initial?: Partial<ItemFormState>;
    initialImages?: ImageRow[];
}) {
    const router = useRouter();
    const { mode, itemId, categories } = props;

    const [title, setTitle] = useState(props.initial?.title ?? "");
    const [slugManual, setSlugManual] = useState(props.initial?.slug ?? "");
    const [slugTouched, setSlugTouched] = useState(mode === "edit"); // edit: slug bleibt
    const [description, setDescription] = useState(props.initial?.description ?? "");
    const [priceCents, setPriceCents] = useState(props.initial?.priceCents ?? "");
    const [published, setPublished] = useState(Boolean(props.initial?.published ?? false));
    const [categoryId, setCategoryId] = useState(
        props.initial?.categoryId ?? (categories[0]?.id ?? "")
    );

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slug = useMemo(
        () => (slugTouched ? slugManual : slugify(title)),
        [slugTouched, slugManual, title]
    );

    const canSave = title.trim().length > 0 && slug.trim().length > 0 && categoryId.trim().length > 0;

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        if (!canSave) return;

        setSaving(true);
        setError(null);

        const payload = {
            title,
            slug,
            description,
            priceCents: priceCents.trim() === "" ? null : Number(priceCents),
            published,
            categoryId,
        };

        const url =
            mode === "create" ? "/api/admin/items" : `/api/admin/items/${itemId}`;

        const method = mode === "create" ? "POST" : "PATCH";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setSaving(false);

        if (!res.ok) {
            const text = await res.text();
            setError(`Save failed (${res.status}): ${text}`);
            return;
        }

        router.push("/admin/items");
        router.refresh();
    }

    async function onDelete() {
        if (mode !== "edit" || !itemId) return;
        if (!confirm("Delete this item?")) return;

        setDeleting(true);
        setError(null);

        const res = await fetch(`/api/admin/items/${itemId}`, { method: "DELETE" });
        setDeleting(false);

        if (!res.ok) {
            const text = await res.text();
            setError(`Delete failed (${res.status}): ${text}`);
            return;
        }

        router.push("/admin/items");
        router.refresh();
    }

    return (
        <div className="space-y-4 max-w-xl">
            <h1 className="text-2xl font-semibold">
                {mode === "create" ? "New Item" : "Edit Item"}
            </h1>

            {categories.length === 0 ? (
                <div className="rounded-md border p-4 text-sm text-neutral-700">
                    You need at least one category before creating items.
                </div>
            ) : (
                <form onSubmit={onSave} className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Title</label>
                        <input
                            className="w-full rounded-md border px-3 py-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus={mode === "create"}
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
                        <p className="text-xs text-neutral-600">
                            Auto-generiert aus Title (editierbar).
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            className="w-full rounded-md border px-3 py-2"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.slug})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            className="w-full rounded-md border px-3 py-2"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Price (cents)</label>
                        <input
                            type="number"
                            className="w-full rounded-md border px-3 py-2"
                            value={priceCents}
                            onChange={(e) => setPriceCents(e.target.value)}
                            placeholder="e.g. 2500"
                            min={0}
                            step={1}
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                        />
                        Published
                    </label>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-2">
                        <button
                            disabled={saving || !canSave || categories.length === 0}
                            className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save"}
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

            {/* ── Image Panel (edit only, once item exists) ── */}
            {mode === "edit" && itemId && (
                <ImagePanel
                    itemId={itemId}
                    initialImages={props.initialImages ?? []}
                />
            )}
        </div>
    );
}