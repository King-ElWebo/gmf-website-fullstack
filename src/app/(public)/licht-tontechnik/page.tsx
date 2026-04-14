import { ProduktFilter } from '@/components/public/ProduktFilter';
import { getProduktFilterData, resolveLightingAudioCatalogTypeSlug } from '@/lib/public-product-list';

interface LichtTontechnikPageProps {
    searchParams: Promise<{
        kategorie?: string;
    }>;
}

export default async function LichtTontechnikPage({ searchParams }: LichtTontechnikPageProps) {
    const resolvedSearchParams = await searchParams;
    const initialCategory = resolvedSearchParams.kategorie?.trim() || 'alle';
    const catalogTypeSlug = await resolveLightingAudioCatalogTypeSlug();
    const { items, categories } = catalogTypeSlug
        ? await getProduktFilterData({ catalogTypeSlug })
        : { items: [], categories: [] };

    return (
        <div className="min-h-screen bg-[#ffffff]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="font-['Nunito'] font-semibold text-[32px] text-[#1a202c] mb-4">
                        Licht- &amp; Tontechnik
                    </h1>
                    <p className="font-['Nunito'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[800px]">
                        Mieten Sie professionelle <strong className="font-semibold text-[#1a202c]">Licht- und Tontechnik</strong> für unvergessliche <strong className="font-semibold text-[#1a202c]">Feiern</strong> und Events. Egal ob <strong className="font-semibold text-[#1a202c]">Soundanlage</strong> für die Gartenparty, DJ Equipment für Ihre <strong className="font-semibold text-[#1a202c]">Hochzeit</strong> oder stimmungsvolle Partybeleuchtung – wir bieten die passende Ausrüstung.
                    </p>
                    {!catalogTypeSlug && (
                        <p className="mt-3 font-['Nunito'] text-[14px] text-[#b45309]">
                            Hinweis: Aktuell konnte kein passender Bereich f&uuml;r Licht- und Tontechnik automatisch zugeordnet werden.
                        </p>
                    )}
                </div>

                <ProduktFilter
                    items={items}
                    categories={categories}
                    initialCategory={initialCategory}
                    initialCatalogType={catalogTypeSlug ?? 'alle'}
                />
            </div>
        </div>
    );
}
