"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SortableRowList from "../_components/sortable-row-list";
import { AdminBadge } from "../_components/ui/AdminBadge";
import { AdminButton } from "../_components/ui/AdminButton";

type FaqRow = {
    id: string;
    question: string;
    answer: string;
    published: boolean;
};

export default function FaqsSortableList({ initialFaqs }: { initialFaqs: FaqRow[] }) {
    const router = useRouter();

    const handleDelete = async (id: string, question: string) => {
        if (!window.confirm(`Möchten Sie die FAQ "${question}" wirklich löschen?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/faqs/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                // If it returns 204 or no json on error, handle accordingly
                const data = res.status !== 204 ? await res.json().catch(() => ({})) : {};
                alert(data.error || "Löschen fehlgeschlagen.");
                return;
            }

            router.refresh();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Ein unerwarteter Fehler ist aufgetreten.");
        }
    };

    return (
        <SortableRowList
            items={initialFaqs}
            emptyText="No FAQs yet."
            columns={[
                {
                    key: "question",
                    header: "Frage",
                    render: (faq) => (
                        <div>
                            <div className="font-semibold text-slate-900">{faq.question}</div>
                            <div className="line-clamp-2 text-xs leading-5 text-slate-500">{faq.answer}</div>
                        </div>
                    ),
                },
                {
                    key: "status",
                    header: "Status",
                    render: (faq) =>
                        faq.published ? (
                            <AdminBadge variant="green">Published</AdminBadge>
                        ) : (
                            <AdminBadge variant="gray">Draft</AdminBadge>
                        ),
                },
            ]}
            renderActions={(faq) => (
                <div className="flex items-center gap-3">
                    <Link href={`/admin/faqs/${faq.id}/edit`}>
                        <AdminButton variant="secondary" size="sm">
                            Bearbeiten
                        </AdminButton>
                    </Link>
                    <AdminButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(faq.id, faq.question)}
                    >
                        Löschen
                    </AdminButton>
                </div>
            )}
            onReorder={async (orderedIds) => {
                const res = await fetch("/api/admin/faqs/reorder", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderedIds }),
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data?.error ?? "Reorder failed");
                }

                return data.faqs;
            }}
        />
    );
}
