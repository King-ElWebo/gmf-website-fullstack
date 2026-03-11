"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/public/Button';
import { getProductById } from '@/data/products';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function ProductDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const product = id ? getProductById(id) : undefined;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="font-['Inter'] font-semibold text-[24px] text-[#1a202c] mb-4">
                        Produkt nicht gefunden
                    </h1>
                    <Link href="/produkte">
                        <Button variant="secondary">Zurück zu den Produkten</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
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
                        <span className="font-['Inter'] text-[#1a202c]">{product.title}</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div>
                        <div className="relative bg-[#e2e8f0] rounded-[8px] overflow-hidden mb-4 aspect-[4/3]">
                            <img
                                src={product.images[currentImageIndex]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />

                            {product.images.length > 1 && (
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
                        <div className="grid grid-cols-3 gap-3">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`aspect-[4/3] rounded-[8px] overflow-hidden border-2 transition-colors ${currentImageIndex === index ? 'border-[#1a3a52]' : 'border-[#cbd5e1]'
                                        }`}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.title} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c]">
                                {product.title}
                            </h1>
                            {product.badge && (
                                <span className={`px-3 py-1 rounded-[4px] font-['Inter'] font-medium text-[12px] ${product.badgeColor === 'yellow'
                                        ? 'bg-[#fbbf24] text-[#1a3a52]'
                                        : 'bg-[#f7f8fa] text-[#2d3748]'
                                    }`}>
                                    {product.badge}
                                </span>
                            )}
                        </div>

                        <p className="font-['Inter'] font-semibold text-[24px] text-[#4a5568] mb-6">
                            {product.price}
                        </p>

                        <div className="mb-8">
                            <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-3">
                                Beschreibung
                            </h2>
                            <p className="font-['Inter'] text-[16px] text-[#4a5568] leading-[25.6px]">
                                {product.longDescription}
                            </p>
                        </div>

                        <div className="mb-8">
                            <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-3">
                                Maße
                            </h2>
                            <p className="font-['Inter'] text-[16px] text-[#4a5568]">
                                {product.dimensions}
                            </p>
                        </div>

                        <div className="mb-8">
                            <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-3">
                                Im Preis enthalten
                            </h2>
                            <ul className="space-y-2">
                                {product.included.map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check size={16} className="text-[#1a3a52] flex-shrink-0" />
                                        <span className="font-['Inter'] text-[14px] text-[#4a5568]">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-8">
                            <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-3">
                                Lieferung & Abholung
                            </h2>
                            <p className="font-['Inter'] text-[16px] text-[#4a5568]">
                                {product.delivery}
                            </p>
                        </div>

                        <div className="mb-8">
                            <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-3">
                                Wichtige Hinweise
                            </h2>
                            <ul className="space-y-2">
                                {product.notes.map((note, index) => (
                                    <li key={index} className="font-['Inter'] text-[14px] text-[#4a5568] flex items-start gap-2">
                                        <span className="text-[#1a3a52]">•</span>
                                        <span>{note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={`/buchen/${product.id}`} className="flex-1">
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
