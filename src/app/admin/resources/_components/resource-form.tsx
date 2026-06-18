"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "../../_components/ui/AdminCard";
import { AdminField, AdminInput, AdminCheckbox } from "../../_components/ui/AdminInputs";
import { AdminButton } from "../../_components/ui/AdminButton";

export default function ResourceForm({
    mode,
    resourceId,
    initial,
}: {
    mode: "create" | "edit";
    resourceId?: string;
    initial?: { name: string; capacityPerDay: number; isActive: boolean };
}) {
    const router = useRouter();
    const [formState, setFormState] = useState({
        name: initial?.name ?? "",
        capacityPerDay: initial?.capacityPerDay?.toString() ?? "1",
        isActive: initial?.isActive ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSave = formState.name.trim().length > 0 && parseInt(formState.capacityPerDay) > 0;

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        if (!canSave) return;

        setError(null);
        setSaving(true);

        const payload = {
            name: formState.name,
            capacityPerDay: parseInt(formState.capacityPerDay),
            isActive: formState.isActive,
        };

        const url = mode === "create" ? "/api/admin/resources" : `/api/admin/resources/${resourceId}`;
        const method = mode === "create" ? "POST" : "PATCH";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setSaving(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error || `Save failed (${res.status})`);
            return;
        }

        router.push("/admin/resources");
        router.refresh();
    }

    async function onDelete() {
        if (mode !== "edit" || !resourceId) return;
        if (!confirm("Ressource wirklich löschen?")) return;

        setDeleting(true);
        setError(null);

        const res = await fetch(`/api/admin/resources/${resourceId}`, { method: "DELETE" });
        setDeleting(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error || `Delete failed (${res.status})`);
            return;
        }

        router.push("/admin/resources");
        router.refresh();
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">{mode === "create" ? "Neue Verfügbarkeitsregel" : "Verfügbarkeitsregel bearbeiten"}</h1>
                <p className="mt-1 text-sm text-slate-500">Operative Regeln für Lieferung, Aufbau oder Betreuung.</p>
            </div>

            <form onSubmit={onSave} className="space-y-6">
                <AdminCard title="Regel & Tageskapazität">
                    <div className="space-y-5">
                        <AdminField label="Name" htmlFor="name">
                            <AdminInput
                                id="name"
                                value={formState.name}
                                onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
                                placeholder="z.B. Lieferteam 1, Sprinter"
                                autoFocus
                            />
                        </AdminField>

                        <AdminField label="Tageskapazität (Punkte/Anzahl)" htmlFor="capacityPerDay" helperText="Wie viele Kapazitäts-Punkte (z.B. Arbeitsstunden, Autos) habt ihr hiervon pro Tag zur Verfügung?">
                            <AdminInput
                                id="capacityPerDay"
                                type="number"
                                min={1}
                                step={1}
                                value={formState.capacityPerDay}
                                onChange={(e) => setFormState(s => ({ ...s, capacityPerDay: e.target.value }))}
                            />
                        </AdminField>

                        <div className="flex items-center">
                            <AdminCheckbox
                                checked={formState.isActive}
                                onChange={(e) => setFormState(s => ({ ...s, isActive: e.target.checked }))}
                                label="Aktiv"
                            />
                        </div>
                    </div>
                </AdminCard>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg">
                    <p className="text-sm text-slate-500">Ihre Änderungen sind noch nicht gespeichert.</p>
                    <div className="flex items-center gap-3">
                        {mode === "edit" && (
                            <AdminButton type="button" variant="danger" onClick={onDelete} disabled={deleting}>
                                {deleting ? "Löscht..." : "Löschen"}
                            </AdminButton>
                        )}
                        <AdminButton type="submit" disabled={saving || !canSave}>
                            {saving ? "Speichert..." : "Speichern"}
                        </AdminButton>
                    </div>
                </div>
            </form>
        </div>
    );
}
