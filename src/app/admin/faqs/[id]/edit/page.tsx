import { notFound } from "next/navigation";
import { getFaqById } from "@/lib/repositories/faqs";
import FaqForm from "../../_components/faq-form";

export default async function EditFaqPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    
    if (!id || typeof id !== "string") return notFound();

    const faq = await getFaqById(id);
    if (!faq) return notFound();

    return (
        <FaqForm
            mode="edit"
            faqId={faq.id}
            initial={{
                question: faq.question,
                answer: faq.answer,
                published: faq.published,
            }}
        />
    );
}
