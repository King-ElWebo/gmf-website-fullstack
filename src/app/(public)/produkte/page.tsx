import { listPublishedItems, listCategories } from '@/lib/repositories/catalog';
import { formatItemPrice, getItemSummary, getPrimaryImageUrl } from '@/lib/public-catalog';
import { ProduktFilter } from '@/components/public/ProduktFilter';

interface ProduktePageProps {
    searchParams: Promise<{
        kategorie?: string;
        bereich?: string;
    }>;
}

export default async function ProduktePage({ searchParams }: ProduktePageProps) {
    const resolvedSearchParams = await searchParams;
    const initialCategory = resolvedSearchParams.kategorie?.trim() || 'alle';
    const initialCatalogType = resolvedSearchParams.bereich?.trim() || 'alle';

    const [items, categories] = await Promise.all([
        listPublishedItems(),
        listCategories(),
    ]);

    const mappedItems = items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: getItemSummary(item),
        price: formatItemPrice(item),
        imageUrl: getPrimaryImageUrl(item),
        categoryName: item.category.name,
        categorySlug: item.category.slug,
        catalogTypeName: item.category.catalogType.name,
        catalogTypeSlug: item.category.catalogType.slug,
    }));

    const mappedCategories = categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        catalogTypeName: category.catalogType.name,
        catalogTypeSlug: category.catalogType.slug,
    }));

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-4">
                        Unsere Produkte
                    </h1>
                    <p className="font-['Inter'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[700px]">
                        Entdecken Sie unsere Auswahl an Eventmodulen, sortiert nach Bereichen und Kategorien aus dem neuen Katalog.
                    </p>
                </div>

                <ProduktFilter
                    items={mappedItems}
                    categories={mappedCategories}
                    initialCategory={initialCategory}
                    initialCatalogType={initialCatalogType}
                />
            </div>
        </div>
    );
}
