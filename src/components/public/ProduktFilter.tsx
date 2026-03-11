"use client";

import { useState } from 'react';
import { ProductCard } from '@/components/public/ProductCard';

interface ProduktItem {
    id: string;
    title: string;
    description: string | null;
    price: string | null;
    imageUrl: string;
    category: string;
}

interface ProduktFilterProps {
    items: ProduktItem[];
    categories: string[];
}

export function ProduktFilter({ items, categories }: ProduktFilterProps) {
    const [selectedCategory, setSelectedCategory] = useState('Alle');

    const filteredItems = selectedCategory === 'Alle'
        ? items
        : items.filter(item => item.category === selectedCategory);

    return (
        <>
            {/* Category Filter */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-3">
                    {['Alle', ...categories].map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-3 rounded-[8px] font-['Inter'] font-medium text-[14px] transition-colors border ${selectedCategory === category
                                ? 'bg-[#1a3a52] text-white border-[#1a3a52]'
                                : 'bg-white text-[#2d3748] border-[#cbd5e1] hover:border-[#1a3a52]'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <ProductCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description ?? ''}
                        price={item.price ?? ''}
                        imageUrl={item.imageUrl}
                    />
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12">
                    <p className="font-['Inter'] text-[16px] text-[#64748b]">
                        Keine Produkte in dieser Kategorie gefunden.
                    </p>
                </div>
            )}
        </>
    );
}
