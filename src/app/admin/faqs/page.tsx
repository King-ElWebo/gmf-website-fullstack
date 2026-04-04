import { listFaqs } from "@/lib/repositories/faqs";
import AdminPageHeader from "../_components/admin-page-header";
import FaqsSortableList from "./faqs-sortable-list";

export default async function FaqsPage() {
    const faqs = await listFaqs();

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="FAQs"
                description="Verwalte haeufige Fragen mit besserer Lesbarkeit und klarer Priorisierung."
                action={{ href: "/admin/faqs/new", label: "New FAQ" }}
            />

            <div className="admin-surface rounded-[28px] p-4 sm:p-5">
                <FaqsSortableList initialFaqs={faqs} />
            </div>
        </div>
    );
}
