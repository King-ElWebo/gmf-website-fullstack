"use client";

import Link from "next/link";
import SortableRowList from "../_components/sortable-row-list";

type FaqRow = {
    id: string;
    question: string;
    answer: string;
    published: boolean;
};

export default function FaqsSortableList({ initialFaqs }: { initialFaqs: FaqRow[] }) {
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
                            <span className="admin-badge admin-badge-green">Published</span>
                        ) : (
                            <span className="admin-badge admin-badge-neutral">Draft</span>
                        ),
                },
            ]}
            renderActions={(faq) => (
                <Link className="font-medium text-blue-600 hover:text-blue-800" href={`/admin/faqs/${faq.id}/edit`}>
                    Edit
                </Link>
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
