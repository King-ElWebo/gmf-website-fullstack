"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "../../_components/ui/AdminCard";
import { AdminField, AdminInput, AdminTextarea, AdminCheckbox } from "../../_components/ui/AdminInputs";
import { AdminButton } from "../../_components/ui/AdminButton";

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
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-semibold text-slate-900">{mode === "create" ? "Neue FAQ" : "FAQ bearbeiten"}</h1>

            <form onSubmit={onSave} className="space-y-6">
                <AdminCard title="FAQ Details" description="Die Frage und die zugehörige Antwort.">
                    <div className="space-y-5">
                        <AdminField label="Frage" htmlFor="question">
                            <AdminInput
                                id="question"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                autoFocus={mode === "create"}
                            />
                        </AdminField>

                        <AdminField label="Antwort" htmlFor="answer">
                            <AdminTextarea
                                id="answer"
                                rows={6}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                            />
                        </AdminField>
                    </div>
                </AdminCard>

                <AdminCard title="Sichtbarkeit" description="Veröffentlichte FAQs werden auf der Webseite angezeigt.">
                    <div className="space-y-4">
                        <AdminCheckbox
                            label="Veröffentlicht"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                        />
                        <p className="text-xs text-slate-500">
                            Die Reihenfolge wird in der FAQ-Übersicht per Drag-and-drop gepflegt.
                        </p>
                    </div>
                </AdminCard>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex items-center gap-3">
                    <AdminButton type="submit" disabled={saving || !canSave}>
                        {saving ? "Speichert..." : "Speichern"}
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
