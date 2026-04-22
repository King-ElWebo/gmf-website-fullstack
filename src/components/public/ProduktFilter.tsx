"use client";

import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/public/ProductCard';
import type { InquiryCartPriceType } from '@/lib/inquiry-cart/pricing';

interface ProduktItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: string;
    priceType: InquiryCartPriceType;
    basePriceCents: number | null;
    priceLabel: string | null;
    trackInventory: boolean;
    totalStock: number;
    imageUrl: string;
    categoryName: string;
    categorySlug: string;
    catalogTypeName: string;
    catalogTypeSlug: string;
}

interface ProduktCategory {
    name: string;
    slug: string;
    catalogTypeName: string;
    catalogTypeSlug: string;
}

interface ProduktFilterProps {
    items: ProduktItem[];
    categories: ProduktCategory[];
    initialCategory?: string;
    initialCatalogType?: string;
    variant?: 'playful' | 'classic';
}

export function ProduktFilter({
    items,
    categories,
    initialCategory = 'alle',
    initialCatalogType = 'alle',
    variant = 'playful',
}: ProduktFilterProps) {
    const [selectedCatalogType, setSelectedCatalogType] = useState(initialCatalogType);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    const catalogTypes = useMemo(() => {
        const unique = new Map<string, string>();

        for (const category of categories) {
            if (!unique.has(category.catalogTypeSlug)) {
                unique.set(category.catalogTypeSlug, category.catalogTypeName);
            }
        }

        return Array.from(unique.entries()).map(([slug, name]) => ({ slug, name }));
    }, [categories]);

    const visibleCategories = useMemo(() => {
        if (selectedCatalogType === 'alle') return categories;
        return categories.filter((category) => category.catalogTypeSlug === selectedCatalogType);
    }, [categories, selectedCatalogType]);

    useEffect(() => {
        if (selectedCategory !== 'alle' && !visibleCategories.some((category) => category.slug === selectedCategory)) {
            setSelectedCategory('alle');
        }
    }, [selectedCategory, visibleCategories]);

    const filteredItems = items.filter((item) => {
        const matchesCatalogType = selectedCatalogType === 'alle' || item.catalogTypeSlug === selectedCatalogType;
        const matchesCategory = selectedCategory === 'alle' || item.categorySlug === selectedCategory;
        return matchesCatalogType && matchesCategory;
    });

    return (
        <>
            {catalogTypes.length > 1 && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-3">
                        {[{ slug: 'alle', name: 'Alle Bereiche' }, ...catalogTypes].map((catalogType) => (
                            <button
                                key={catalogType.slug}
                                onClick={() => setSelectedCatalogType(catalogType.slug)}
                                style={variant === 'playful' ? { fontFamily: 'var(--font-fredoka), sans-serif' } : undefined}
                                className={
                                    variant === 'classic'
                                        ? `px-6 py-3 rounded-[16px] font-['Nunito'] font-medium text-[14px] transition-colors border ${selectedCatalogType === catalogType.slug
                                            ? 'bg-[#1a3a52] text-white border-[#1a3a52]'
                                            : 'bg-white text-[#2d3748] border-[#cbd5e1] hover:border-[#1a3a52]'
                                        }`
                                        : `px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-[14px] sm:text-[16px] transition-all border-4 shadow-sm hover:-translate-y-1 ${selectedCatalogType === catalogType.slug
                                            ? 'bg-blue-500 text-white border-blue-700 shadow-[0_4px_0_#1d4ed8]'
                                            : 'bg-white text-blue-800 border-blue-200 hover:border-blue-400 hover:shadow-[0_4px_0_#93c5fd]'
                                        }`
                                }
                            >
                                {catalogType.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-8">
                <div className="flex flex-wrap gap-3">
                    {[{ slug: 'alle', name: 'Alle Kategorien', catalogTypeName: '', catalogTypeSlug: 'alle' }, ...visibleCategories].map((category) => (
                        <button
                            key={`${category.catalogTypeSlug}-${category.slug}`}
                            onClick={() => setSelectedCategory(category.slug)}
                            style={variant === 'playful' ? { fontFamily: 'var(--font-fredoka), sans-serif' } : undefined}
                            className={
                                variant === 'classic'
                                    ? `px-6 py-3 rounded-[16px] font-['Nunito'] font-medium text-[14px] transition-colors border ${selectedCategory === category.slug
                                        ? 'bg-[#1a3a52] text-white border-[#1a3a52]'
                                        : 'bg-white text-[#2d3748] border-[#cbd5e1] hover:border-[#1a3a52]'
                                    }`
                                    : `px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-[14px] sm:text-[16px] transition-all border-4 shadow-sm hover:-translate-y-1 ${selectedCategory === category.slug
                                        ? 'bg-red-500 text-white border-red-700 shadow-[0_4px_0_#b91c1c]'
                                        : 'bg-white text-red-700 border-red-200 hover:border-red-400 hover:shadow-[0_4px_0_#fca5a5]'
                                    }`
                            }
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className={variant === 'classic' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8'}>
                {filteredItems.map((item) => (
                    <ProductCard
                        key={item.id}
                        id={item.id}
                        slug={item.slug}
                        title={item.title}
                        description={item.description}
                        price={item.price}
                        priceType={item.priceType}
                        basePriceCents={item.basePriceCents}
                        priceLabel={item.priceLabel}
                        trackInventory={item.trackInventory}
                        totalStock={item.totalStock}
                        imageUrl={item.imageUrl}
                        badge={catalogTypes.length > 1 ? item.catalogTypeName : undefined}
                        badgeColor="gray"
                        variant={variant}
                    />
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12">
                    <p className="font-['Nunito'] text-[16px] text-[#64748b]">
                        Keine Produkte in diesem Bereich gefunden.
                    </p>
                </div>
            )}
        </>
    );
}
