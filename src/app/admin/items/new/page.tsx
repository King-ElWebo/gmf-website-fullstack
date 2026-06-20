import { listCategories } from "@/lib/repositories/categories";
import { listCatalogTypes } from "@/lib/repositories/catalog-types";
import { listResources } from "@/lib/repositories/resources";
import { db } from "@/lib/db";
import ItemForm from "../_components/item-form";

export default async function NewItemPage() {
    const [categories, catalogTypes, resources, infoTemplates] = await Promise.all([
        listCategories(),
        listCatalogTypes(),
        listResources(),
        db.infoTemplate.findMany({ orderBy: { title: "asc" } }),
    ]);

    return (
        <ItemForm
            mode="create"
            resources={resources}
            infoTemplates={infoTemplates}
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
