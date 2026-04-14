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
}

export function ProduktFilter({
    items,
    categories,
    initialCategory = 'alle',
    initialCatalogType = 'alle',
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
                                className={`px-6 py-3 rounded-[16px] font-['Nunito'] font-medium text-[14px] transition-colors border ${selectedCatalogType === catalogType.slug
                                    ? 'bg-[#1a3a52] text-white border-[#1a3a52]'
                                    : 'bg-white text-[#2d3748] border-[#cbd5e1] hover:border-[#1a3a52]'
                                    }`}
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
                            className={`px-6 py-3 rounded-[16px] font-['Nunito'] font-medium text-[14px] transition-colors border ${selectedCategory === category.slug
                                ? 'bg-[#1a3a52] text-white border-[#1a3a52]'
                                : 'bg-white text-[#2d3748] border-[#cbd5e1] hover:border-[#1a3a52]'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
