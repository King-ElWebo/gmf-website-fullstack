"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { slugify } from "@/lib/slug";

export default function NewCategoryPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [slugManual, setSlugManual] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const slug = useMemo(() => (slugTouched ? slugManual : slugify(name)), [name, slugManual, slugTouched]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const res = await fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, slug }),
        });

        setSaving(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error ?? "Create failed");
            return;
        }

        router.push("/admin/categories");
        router.refresh();
    }

    return (
        <div className="space-y-4 max-w-xl">
            <h1 className="text-2xl font-semibold">New Category</h1>

            <form onSubmit={onSubmit} className="space-y-3">
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
                    <p className="text-xs text-neutral-600">Auto-generiert aus Name (editierbar).</p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    disabled={saving || !name || !slug}
                    className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Create"}
                </button>
            </form>
        </div>
    );
}