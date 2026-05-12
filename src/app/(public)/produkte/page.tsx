import { ProduktFilter } from '@/components/public/ProduktFilter';
import { DeliveryNoticeBox } from '@/components/public/PricingNotice';
import { getProduktFilterData } from '@/lib/public-product-list';
import { getDefaultCatalogType } from '@/lib/repositories/catalog-types';

interface ProduktePageProps {
    searchParams: Promise<{
        kategorie?: string;
    }>;
}

export default async function ProduktePage({ searchParams }: ProduktePageProps) {
    const resolvedSearchParams = await searchParams;
    const initialCategory = resolvedSearchParams.kategorie?.trim() || 'alle';

    // Only load items/categories belonging to the default catalog type
    const defaultType = await getDefaultCatalogType();
    const catalogTypeSlug = defaultType?.slug;

    const { items, categories } = catalogTypeSlug
        ? await getProduktFilterData({ catalogTypeSlug })
        : { items: [], categories: [] };

    return (
        <div className="min-h-screen relative" style={{ backgroundColor: '#dbf4ff', backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 11%), radial-gradient(circle, #fff 10%, transparent 11%)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}>
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10">
                <div className="mb-8 sm:mb-12 text-center bg-white/70 backdrop-blur-sm p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border-4 border-white shadow-sm inline-block mx-auto max-w-4xl flex flex-col items-center">
                    <h1 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(1.9rem,8vw,3rem)] text-[#e11d48] mb-3 sm:mb-4 drop-shadow-sm">
                        🎈 Unsere lustigen Produkte! 🎈
                    </h1>
                    <p className="font-['Nunito'] text-[15px] sm:text-[18px] text-[#475569] leading-[1.6] sm:leading-[28px] max-w-[800px] font-medium">
                        Entdecken Sie unsere bunte Auswahl: Ob coole <strong className="font-bold text-blue-600">Hüpfburg</strong>, eine süße <strong className="font-bold text-yellow-600">Candybar</strong> für die Feier oder spannende <strong className="font-bold text-green-600">Kinderspiele</strong> – wir bringen den Spaß direkt zu Ihrem Event!
                    </p>
                </div>

                <ProduktFilter
                    items={items}
                    categories={categories}
                    initialCategory={initialCategory}
                    initialCatalogType={catalogTypeSlug ?? 'alle'}
                />

                <DeliveryNoticeBox className="mt-10 bg-white/80" />
            </div>
        </div>
    );
}
