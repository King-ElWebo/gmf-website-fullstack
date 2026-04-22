import { notFound } from "next/navigation";
import { getCatalogTypeById } from "@/lib/repositories/catalog-types";
import CatalogTypeForm from "../../_components/catalog-type-form";

export default async function EditCatalogTypePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    if (!id || typeof id !== "string") return notFound();

    const catalogType = await getCatalogTypeById(id);
    if (!catalogType) return notFound();

    return (
        <CatalogTypeForm
            mode="edit"
            catalogType={{
                id: catalogType.id,
                name: catalogType.name,
                slug: catalogType.slug,
                description: catalogType.description,
                navLabel: catalogType.navLabel,
                showInNav: catalogType.showInNav,
                isDefault: catalogType.isDefault,
                sortOrder: catalogType.sortOrder,
                isActive: catalogType.isActive,
                categoryCount: catalogType._count.categories,
            }}
        />
    );
}
