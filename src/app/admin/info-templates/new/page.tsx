import { Metadata } from "next";
import Link from "next/link";
import AdminPageHeader from "../../_components/admin-page-header";
import { InfoTemplateForm } from "../_components/info-template-form";

export const metadata: Metadata = {
    title: "Neue Hinweis-Vorlage | GMF Admin",
};

export default function NewInfoTemplatePage() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <AdminPageHeader
                title="Neue Hinweis-Vorlage"
                description="Lege eine neue Vorlage für Produkthinweise an."
                eyebrow="Hinweis-Vorlagen"
            />
            <InfoTemplateForm />
        </div>
    );
}
