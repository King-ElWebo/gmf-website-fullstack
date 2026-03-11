"use client";

import { useState } from 'react';
import { ProductCard } from '@/components/public/ProductCard';
import { products, categories, getProductsByCategory } from '@/data/products';

export default function ProduktePage() {
    const [selectedCategory, setSelectedCategory] = useState('Alle');

    const filteredProducts = getProductsByCategory(selectedCategory);

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

                {/* Category Filter */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-3">
                        {categories.map(category => (
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
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="font-['Inter'] text-[16px] text-[#64748b]">
                            Keine Produkte in dieser Kategorie gefunden.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
