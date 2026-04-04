import { listCategories } from "@/lib/repositories/categories";
import ItemForm from "../_components/item-form";

export default async function NewItemPage() {
    const categories = await listCategories();

    return (
        <ItemForm
            mode="create"
            categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                catalogTypeName: c.catalogType.name,
            }))}
            initial={{
                published: false,
                priceType: "FIXED",
                depositRequired: false,
                cleaningFeeApplies: false,
                dryingFeeApplies: false,
                deliveryAvailable: false,
                pickupAvailable: false,
                requiresDeliveryAddress: false,
            }}
        />
    );
}
