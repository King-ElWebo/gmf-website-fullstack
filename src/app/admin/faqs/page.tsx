import Link from "next/link";
import { listFaqs } from "@/lib/repositories/faqs";

export default async function FaqsPage() {
    const faqs = await listFaqs();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">FAQs</h1>
                <Link className="rounded-md bg-white text-black hover:transform hover:translate-y-[-2px] px-3 py-2 text-sm" href="/admin/faqs/new">
                    New FAQ
                </Link>
            </div>

            <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="text-left">
                        <tr>
                            <th className="p-3">Frage</th>
                            <th className="p-3">Sortierung</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faqs.map((faq: {
                            id: string;
                            question: string;
                            answer: string;
                            published: boolean;
                            sortOrder: number;
                        }) => (
                            <tr key={faq.id} className="border-t">
                                <td className="p-3">{faq.question}</td>
                                <td className="p-3 text-neutral-600">
                                    {faq.sortOrder}
                                </td>
                                <td className="p-3">
                                    {faq.published ? (
                                        <span className="text-green-600">Published</span>
                                    ) : (
                                        <span className="text-yellow-600">Draft</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    <Link className="underline" href={`/admin/faqs/${faq.id}/edit`}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {faqs.length === 0 && (
                            <tr>
                                <td className="p-3 text-neutral-600" colSpan={4}>
                                    No FAQs yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
