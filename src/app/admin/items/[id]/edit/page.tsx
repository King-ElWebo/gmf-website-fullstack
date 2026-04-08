import { notFound } from "next/navigation";
import { listCategories } from "@/lib/repositories/categories";
import { getItemById } from "@/lib/repositories/items";
import { listByItemId } from "@/lib/repositories/item-images";
import ItemForm from "../../_components/item-form";

export default async function EditItemPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ uploadError?: string }>;
}) {
    const { id } = await params;
    const { uploadError } = await searchParams;
    if (!id || typeof id !== "string") return notFound();

    const [categories, item, images] = await Promise.all([
        listCategories(),
        getItemById(id),
        listByItemId(id),
    ]);
    if (!item) return notFound();

    return (
        <ItemForm
            mode="edit"
            itemId={item.id}
            initialError={typeof uploadError === "string" ? uploadError : undefined}
            categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                catalogTypeName: c.catalogType.name,
            }))}
            initialImages={images}
            initial={{
                title: item.title,
                slug: item.slug,
                shortDescription: item.shortDescription ?? "",
                longDescription: item.longDescription ?? item.description ?? "",
                videoUrl: item.videoUrl ?? "",
                priceType: item.priceType,
                basePriceCents: item.basePriceCents?.toString() ?? item.priceCents?.toString() ?? "",
                priceLabel: item.priceLabel ?? "",
                depositRequired: item.depositRequired,
                depositLabel: item.depositLabel ?? "",
                depositInfo: item.depositInfo ?? "",
                cleaningFeeApplies: item.cleaningFeeApplies,
                cleaningFeeLabel: item.cleaningFeeLabel ?? "",
                cleaningFeeInfo: item.cleaningFeeInfo ?? "",
                dryingFeeApplies: item.dryingFeeApplies,
                dryingFeeLabel: item.dryingFeeLabel ?? "",
                dryingFeeInfo: item.dryingFeeInfo ?? "",
                additionalCostsInfo: item.additionalCostsInfo ?? "",
                deliveryAvailable: item.deliveryAvailable,
                pickupAvailable: item.pickupAvailable,
                requiresDeliveryAddress: item.requiresDeliveryAddress,
                deliveryInfo: item.deliveryInfo ?? "",
                usageInfo: item.usageInfo ?? "",
                rentalNotes: item.rentalNotes ?? "",
                setupRequirements: item.setupRequirements ?? "",
                accessRequirements: item.accessRequirements ?? "",
                trackInventory: item.trackInventory,
                totalStock: item.totalStock.toString(),
                published: item.published,
                categoryId: item.categoryId,
            }}
        />
    );
}
