import { notFound } from 'next/navigation';
import { getPublishedItemById } from '@/lib/repositories/catalog';
import { BuchungsFormular } from '@/components/public/BuchungsFormular';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: PageProps) {
    const { id } = await params;
    const item = await getPublishedItemById(id);

    if (!item) {
        notFound();
    }

    const mappedItem = {
        id: item.id,
        title: item.title,
        price: item.priceCents != null
            ? `ab ${(item.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Tag`
            : null,
        imageUrl: item.images[0]?.url ?? '',
    };

    return <BuchungsFormular item={mappedItem} />;
}
