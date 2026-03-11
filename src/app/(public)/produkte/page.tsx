import { listPublishedItems, listCategories } from '@/lib/repositories/catalog';
import { ProduktFilter } from '@/components/public/ProduktFilter';

export default async function ProduktePage() {
    const [items, categories] = await Promise.all([
        listPublishedItems(),
        listCategories(),
    ]);

    // Map Prisma items to the shape ProduktFilter expects
    const mappedItems = items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.priceCents != null
            ? `ab ${(item.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Tag`
            : null,
        imageUrl: item.images[0]?.url ?? '',
        category: item.category.name,
    }));

    const categoryNames = categories.map(c => c.name);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-4">
                        Unsere Produkte
                    </h1>
                    <p className="font-['Inter'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[700px]">
                        Entdecken Sie unsere vielfältige Auswahl an Hüpfburgen und Eventmodulen.
                        Perfekt für Kindergeburtstage, Firmenfeiern und alle besonderen Anlässe.
                    </p>
                </div>

                <ProduktFilter items={mappedItems} categories={categoryNames} />
            </div>
        </div>
    );
}
