"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { AdminCard } from "../../_components/ui/AdminCard";
import { AdminField, AdminInput, AdminTextarea, AdminCheckbox } from "../../_components/ui/AdminInputs";
import { AdminButton } from "../../_components/ui/AdminButton";

type CatalogTypeData = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    navLabel: string | null;
    showInNav: boolean;
    isDefault: boolean;
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
    const [navLabel, setNavLabel] = useState(catalogType?.navLabel ?? "");
    const [showInNav, setShowInNav] = useState(catalogType?.showInNav ?? true);
    const [isDefault, setIsDefault] = useState(catalogType?.isDefault ?? false);
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
            navLabel: navLabel.trim() || null,
            showInNav,
            isDefault,
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
        <div className="max-w-5xl space-y-6">
            <h1 className="text-2xl font-semibold text-slate-900">{mode === "create" ? "New Catalog Type" : "Edit Catalog Type"}</h1>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                    {/* Left Column */}
                    <AdminCard title="General Information" description="Basic details about this catalog type.">
                        <div className="space-y-5">
                            <AdminField label="Name *" htmlFor="name">
                                <AdminInput
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </AdminField>

                            <AdminField label="Slug" htmlFor="slug" helperText="Used as a stable key for filtering and integrations.">
                                <AdminInput
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlugTouched(true);
                                        setSlugManual(e.target.value);
                                    }}
                                />
                            </AdminField>

                            <AdminField label="Beschreibung" htmlFor="description">
                                <AdminTextarea
                                    id="description"
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optionale Beschreibung dieses Katalogtyps..."
                                />
                            </AdminField>
                        </div>
                    </AdminCard>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <AdminCard title="Navigation & Frontend" description="Settings for displaying this type on the website.">
                            <div className="space-y-5">
                                <AdminField label="Navbar-Linkname" htmlFor="navLabel" helperText="Wird als Linktext in der Navigation angezeigt. Wenn leer, wird der Name verwendet.">
                                    <AdminInput
                                        id="navLabel"
                                        value={navLabel}
                                        onChange={(e) => setNavLabel(e.target.value)}
                                        placeholder={name || "z.B. Licht & Ton"}
                                    />
                                </AdminField>

                                <div className="space-y-4 pt-2">
                                    <AdminCheckbox
                                        label="In der Navigation anzeigen"
                                        checked={showInNav}
                                        onChange={(e) => setShowInNav(e.target.checked)}
                                    />

                                    <AdminCheckbox
                                        label="Standard-Produktseite"
                                        description="Produkte-Hauptseite zeigt primär diesen Typ."
                                        checked={isDefault}
                                        onChange={(e) => setIsDefault(e.target.checked)}
                                    />
                                </div>
                            </div>
                        </AdminCard>

                        <AdminCard title="Status" description="Control visibility of this catalog type.">
                            <div className="space-y-5">
                                <AdminCheckbox
                                    label="Aktiv"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />

                                {mode === "edit" && typeof catalogType?.categoryCount === "number" && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                        Zugeordnete Kategorien: <span className="font-semibold">{catalogType.categoryCount}</span>
                                    </div>
                                )}
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
        </div>
    );
}
