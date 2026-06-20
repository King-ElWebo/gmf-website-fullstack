import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader } from "../../../_components/ui/AdminHeader";
import { InfoTemplateForm } from "../../_components/info-template-form";

export const metadata: Metadata = {
    title: "Hinweis-Vorlage bearbeiten | GMF Admin",
};

export default async function EditInfoTemplatePage({
    params,
}: {
    params: { id: string };
}) {
    const template = await db.infoTemplate.findUnique({
        where: { id: params.id },
        include: {
            blocks: {
                orderBy: { sortOrder: "asc" },
            },
        },
    });

    if (!template) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <AdminHeader
                title="Hinweis-Vorlage bearbeiten"
                description={`Bearbeite die Vorlage "${template.internalName}".`}
                breadcrumbs={[
                    { label: "Hinweis-Vorlagen", href: "/admin/info-templates" },
                    { label: template.internalName, href: `/admin/info-templates/${template.id}/edit` },
                ]}
            />
            <InfoTemplateForm initialData={template} />
        </div>
    );
}
