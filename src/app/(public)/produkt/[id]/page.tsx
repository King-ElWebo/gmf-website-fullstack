import { notFound } from 'next/navigation';
import { getPublishedItemById } from '@/lib/repositories/catalog';
import { ProduktDetailClient } from '@/components/public/ProduktDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id } = await params;
    const item = await getPublishedItemById(id);

    if (!item) {
        notFound();
    }

    const mappedItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.priceCents != null
            ? `ab ${(item.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Tag`
            : null,
        images: item.images.map(img => img.url),
        category: item.category.name,
    };

    return <ProduktDetailClient item={mappedItem} />;
}
