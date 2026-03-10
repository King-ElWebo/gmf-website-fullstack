"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { slugify } from "@/lib/slug";

export default function EditCategoryForm({
    category,
}: {
    category: { id: string; name: string; slug: string };
}) {
    const router = useRouter();
    const [name, setName] = useState(category.name);
    const [slugManual, setSlugManual] = useState(category.slug);
    const [slugTouched, setSlugTouched] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const slug = useMemo(() => (slugTouched ? slugManual : slugify(name)), [name, slugManual, slugTouched]);

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const res = await fetch(`/api/admin/categories/${category.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, slug }),
        });

        setSaving(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error ?? "Update failed");
            return;
        }

        router.push("/admin/categories");
        router.refresh();
    }

    async function onDelete() {
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
        <div className="space-y-4 max-w-xl">
            <h1 className="text-2xl font-semibold">Edit Category</h1>

            <form onSubmit={onSave} className="space-y-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Name</label>
                    <input className="w-full rounded-md border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
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
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2">
                    <button
                        disabled={saving || !name || !slug}
                        className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={deleting}
                        className="rounded-md border px-4 py-2 text-sm disabled:opacity-60"
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </form>
        </div>
    );
}