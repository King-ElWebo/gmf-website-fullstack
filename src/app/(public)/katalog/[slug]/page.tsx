import { notFound, redirect } from 'next/navigation';
import { ProduktFilter } from '@/components/public/ProduktFilter';
import { getProduktFilterData } from '@/lib/public-product-list';
import { getActiveCatalogTypeBySlug, getDefaultCatalogType } from '@/lib/repositories/catalog-types';

interface KatalogPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{
        kategorie?: string;
    }>;
}

export default async function KatalogPage({ params, searchParams }: KatalogPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const initialCategory = resolvedSearchParams.kategorie?.trim() || 'alle';

    // If the slug matches the default catalog type, redirect to /produkte
    const defaultType = await getDefaultCatalogType();
    if (defaultType && defaultType.slug === slug) {
        redirect('/produkte');
    }

    // Load the catalog type by slug
    const catalogType = await getActiveCatalogTypeBySlug(slug);
    if (!catalogType) {
        notFound();
    }

    const { items, categories } = await getProduktFilterData({ catalogTypeSlug: slug });

    // Use navLabel or name as the page title
    const pageTitle = catalogType.name;
    const pageDescription = catalogType.description;

    return (
        <div className="min-h-screen bg-[#ffffff]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="font-['Nunito'] font-semibold text-[32px] text-[#1a202c] mb-4">
                        {pageTitle}
                    </h1>
                    {pageDescription && (
                        <p className="font-['Nunito'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[800px]">
                            {pageDescription}
                        </p>
                    )}
                </div>

                <ProduktFilter
                    items={items}
                    categories={categories}
                    initialCategory={initialCategory}
                    initialCatalogType={slug}
                />
            </div>
        </div>
    );
}
