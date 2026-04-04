import { notFound } from 'next/navigation';
import { getPublishedItemBySlug } from '@/lib/repositories/catalog';
import { formatItemPrice, getPrimaryImageUrl } from '@/lib/public-catalog';
import { LegacyBookingRedirect } from '@/components/public/LegacyBookingRedirect';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: PageProps) {
    const { id: slug } = await params;
    const item = await getPublishedItemBySlug(slug);

    if (!item) {
        notFound();
    }

    const mappedItem = {
        id: item.id,
        slug: item.slug,
        title: item.title,
        price: formatItemPrice(item),
        imageUrl: getPrimaryImageUrl(item),
    };

    return <LegacyBookingRedirect item={mappedItem} />;
}
