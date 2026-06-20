import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AdminPageHeader from "../../../_components/admin-page-header";
import { InfoTemplateForm } from "../../_components/info-template-form";

export const metadata: Metadata = {
    title: "Hinweis-Vorlage bearbeiten | GMF Admin",
};

export default async function EditInfoTemplatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const template = await db.infoTemplate.findUnique({
        where: { id },
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
            <AdminPageHeader
                title="Hinweis-Vorlage bearbeiten"
                description={`Bearbeite die Vorlage "${template.internalName}".`}
                eyebrow="Hinweis-Vorlagen"
            />
            <InfoTemplateForm initialData={template} />
        </div>
    );
}
