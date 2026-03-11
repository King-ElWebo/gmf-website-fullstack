"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/public/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProduktDetailItem {
    id: string;
    title: string;
    description: string | null;
    price: string | null;
    images: string[];
    category: string;
}

export function ProduktDetailClient({ item }: { item: ProduktDetailItem }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-[14px]">
                        <Link href="/" className="font-['Inter'] text-[#64748b] hover:text-[#1a3a52]">
                            Start
                        </Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <Link href="/produkte" className="font-['Inter'] text-[#64748b] hover:text-[#1a3a52]">
                            Produkte
                        </Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <span className="font-['Inter'] text-[#1a202c]">{item.title}</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div>
                        {item.images.length > 0 ? (
                            <>
                                <div className="relative bg-[#e2e8f0] rounded-[8px] overflow-hidden mb-4 aspect-[4/3]">
                                    <img
                                        src={item.images[currentImageIndex]}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />

                                    {item.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                                            >
                                                <ChevronLeft className="text-[#1a3a52]" size={24} />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                                            >
                                                <ChevronRight className="text-[#1a3a52]" size={24} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                {item.images.length > 1 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {item.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`aspect-[4/3] rounded-[8px] overflow-hidden border-2 transition-colors ${currentImageIndex === index ? 'border-[#1a3a52]' : 'border-[#cbd5e1]'
                                                    }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${item.title} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-[#e2e8f0] rounded-[8px] aspect-[4/3] flex items-center justify-center">
                                <p className="font-['Inter'] text-[14px] text-[#64748b]">Kein Bild vorhanden</p>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div>
                        <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-4">
                            {item.title}
                        </h1>

                        {item.price && (
                            <p className="font-['Inter'] font-semibold text-[24px] text-[#4a5568] mb-6">
                                {item.price}
                            </p>
                        )}

                        {item.description && (
                            <div className="mb-8">
                                <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-3">
                                    Beschreibung
                                </h2>
                                <p className="font-['Inter'] text-[16px] text-[#4a5568] leading-[25.6px]">
                                    {item.description}
                                </p>
                            </div>
                        )}

                        <div className="mb-8">
                            <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-3">
                                Kategorie
                            </h2>
                            <p className="font-['Inter'] text-[16px] text-[#4a5568]">
                                {item.category}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={`/buchen/${item.id}`} className="flex-1">
                                <Button variant="primary" className="w-full">Jetzt buchen</Button>
                            </Link>
                            <Link href="/kontakt" className="flex-1">
                                <Button variant="secondary" className="w-full">Fragen? Kontakt</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
