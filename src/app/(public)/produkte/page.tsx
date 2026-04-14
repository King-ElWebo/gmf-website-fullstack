import { ProduktFilter } from '@/components/public/ProduktFilter';
import { getProduktFilterData } from '@/lib/public-product-list';

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
    const { items, categories } = await getProduktFilterData();

    return (
        <div className="min-h-screen bg-[#fffbeb]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="font-['Nunito'] font-semibold text-[32px] text-[#1a202c] mb-4">
                        Unsere Produkte
                    </h1>
                    <p className="font-['Nunito'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[800px]">
                        Entdecken Sie unsere große Auswahl: Ob Sie eine aufregende <strong className="font-semibold text-[#1a202c]">Hüpfburg mieten</strong>, eine elegante <strong className="font-semibold text-[#1a202c]">Candybar</strong> für Ihre <strong className="font-semibold text-[#1a202c]">Hochzeit</strong> suchen oder spannende <strong className="font-semibold text-[#1a202c]">Kinderspiele</strong> für Kinderfeiern benötigen – bei uns finden Sie die passende Eventausstattung. Flexibel buchbar für Events und private Feiern jeder Art.
                    </p>
                </div>

                <ProduktFilter
                    items={items}
                    categories={categories}
                    initialCategory={initialCategory}
                    initialCatalogType={initialCatalogType}
                />
            </div>
        </div>
    );
}
