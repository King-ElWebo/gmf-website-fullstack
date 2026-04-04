import { notFound } from 'next/navigation';
import { getPublishedItemBySlug } from '@/lib/repositories/catalog';
import { formatItemPrice, getItemLongDescription, getItemSummary, getVideoUrl } from '@/lib/public-catalog';
import { ProduktDetailClient } from '@/components/public/ProduktDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id: slug } = await params;
    const item = await getPublishedItemBySlug(slug);

    if (!item) {
        notFound();
    }

    const mappedItem = {
        id: item.id,
        slug: item.slug,
        title: item.title,
        summary: getItemSummary(item),
        description: getItemLongDescription(item),
        price: formatItemPrice(item),
        images: item.images.map((image) => image.url),
        videoUrl: getVideoUrl(item),
        category: item.category.name,
        catalogType: item.category.catalogType.name,
        deliveryInfo: item.deliveryInfo,
        additionalCostsInfo: item.additionalCostsInfo,
        usageInfo: item.usageInfo,
        rentalNotes: item.rentalNotes,
        setupRequirements: item.setupRequirements,
        accessRequirements: item.accessRequirements,
        depositInfo: item.depositInfo,
        depositLabel: item.depositLabel,
        cleaningFeeInfo: item.cleaningFeeInfo,
        cleaningFeeLabel: item.cleaningFeeLabel,
        dryingFeeInfo: item.dryingFeeInfo,
        dryingFeeLabel: item.dryingFeeLabel,
        deliveryAvailable: item.deliveryAvailable,
        pickupAvailable: item.pickupAvailable,
        requiresDeliveryAddress: item.requiresDeliveryAddress,
    };

    return <ProduktDetailClient item={mappedItem} />;
}
