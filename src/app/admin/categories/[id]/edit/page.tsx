import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/repositories/categories";
import { listCatalogTypes } from "@/lib/repositories/catalog-types";
import CategoryForm from "../../_components/category-form";

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    if (!id || typeof id !== "string") return notFound();

    const [category, catalogTypes] = await Promise.all([getCategoryById(id), listCatalogTypes()]);
    if (!category) return notFound();

    return (
        <CategoryForm
            mode="edit"
            category={{
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: (category as any).description,
                imageUrl: (category as any).imageUrl,
                imageKey: (category as any).imageKey,
                catalogTypeId: category.catalogTypeId,
            }}
            catalogTypes={catalogTypes.map((type) => ({
                id: type.id,
                name: type.name,
                slug: type.slug,
                isActive: type.isActive,
            }))}
        />
    );
}
