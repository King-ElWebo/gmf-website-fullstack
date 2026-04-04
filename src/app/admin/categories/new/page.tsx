import CategoryForm from "../_components/category-form";
import { listCatalogTypesForSelect } from "@/lib/repositories/catalog-types";

export default async function NewCategoryPage() {
    const catalogTypes = await listCatalogTypesForSelect();

    return (
        <CategoryForm
            mode="create"
            catalogTypes={catalogTypes.map((type) => ({
                id: type.id,
                name: type.name,
                slug: type.slug,
                isActive: type.isActive,
            }))}
        />
    );
}
