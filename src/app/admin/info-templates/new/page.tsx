import { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "../../_components/ui/AdminHeader";
import { InfoTemplateForm } from "../_components/info-template-form";

export const metadata: Metadata = {
    title: "Neue Hinweis-Vorlage | GMF Admin",
};

export default function NewInfoTemplatePage() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <AdminHeader
                title="Neue Hinweis-Vorlage"
                description="Lege eine neue Vorlage für Produkthinweise an."
                breadcrumbs={[
                    { label: "Hinweis-Vorlagen", href: "/admin/info-templates" },
                    { label: "Neu", href: "/admin/info-templates/new" },
                ]}
            />
            <InfoTemplateForm />
        </div>
    );
}
