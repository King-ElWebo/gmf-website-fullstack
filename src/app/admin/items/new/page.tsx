import { listCategories } from "@/lib/repositories/categories";
import { listCatalogTypes } from "@/lib/repositories/catalog-types";
import ItemForm from "../_components/item-form";

export default async function NewItemPage() {
    const [categories, catalogTypes] = await Promise.all([
        listCategories(),
        listCatalogTypes(),
    ]);

    return (
        <ItemForm
            mode="create"
            catalogTypes={catalogTypes.map((ct) => ({ id: ct.id, name: ct.name }))}
            categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                catalogTypeName: c.catalogType.name,
                catalogTypeId: c.catalogTypeId,
            }))}
            initial={{
                published: false,
                trackInventory: true,
                totalStock: "1",
                priceType: "FIXED",
                depositRequired: false,
                cleaningFeeApplies: false,
                dryingFeeApplies: false,
                deliveryAvailable: true,
                pickupAvailable: true,
                requiresDeliveryAddress: false,
            }}
        />
    );
}
