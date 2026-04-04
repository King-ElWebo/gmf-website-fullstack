"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FaqFormState = {
    question: string;
    answer: string;
    published: boolean;
};

export default function FaqForm(props: {
    mode: "create" | "edit";
    faqId?: string;
    initial?: Partial<FaqFormState>;
}) {
    const router = useRouter();
    const { mode, faqId } = props;

    const [question, setQuestion] = useState(props.initial?.question ?? "");
    const [answer, setAnswer] = useState(props.initial?.answer ?? "");
    const [published, setPublished] = useState(Boolean(props.initial?.published ?? true));
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSave = question.trim().length > 0 && answer.trim().length > 0;

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        if (!canSave) return;

        setSaving(true);
        setError(null);

        const payload = {
            question,
            answer,
            published,
        };

        const url = mode === "create" ? "/api/admin/faqs" : `/api/admin/faqs/${faqId}`;
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

        router.push("/admin/faqs");
        router.refresh();
    }

    async function onDelete() {
        if (mode !== "edit" || !faqId) return;
        if (!confirm("Delete this FAQ?")) return;

        setDeleting(true);
        setError(null);

        const res = await fetch(`/api/admin/faqs/${faqId}`, { method: "DELETE" });
        setDeleting(false);

        if (!res.ok) {
            const text = await res.text();
            setError(`Delete failed (${res.status}): ${text}`);
            return;
        }

        router.push("/admin/faqs");
        router.refresh();
    }

    return (
        <div className="max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">{mode === "create" ? "Neue FAQ" : "FAQ bearbeiten"}</h1>

            <form onSubmit={onSave} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Frage</label>
                    <input
                        className="w-full rounded-md border px-3 py-2"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        autoFocus={mode === "create"}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Antwort</label>
                    <textarea
                        className="w-full rounded-md border px-3 py-2"
                        rows={6}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                    Veröffentlicht
                </label>

                <p className="text-xs text-neutral-500">
                    Die Reihenfolge wird in der FAQ-Übersicht per Drag-and-drop gepflegt.
                </p>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2 pt-2">
                    <button
                        disabled={saving || !canSave}
                        className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                    >
                        {saving ? "Speichert..." : "Speichern"}
                    </button>

                    {mode === "edit" && (
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={deleting}
                            className="rounded-md border border-neutral-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                            {deleting ? "Löscht..." : "Löschen"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
