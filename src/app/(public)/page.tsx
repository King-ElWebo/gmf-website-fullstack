"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/public/Button';
import { ProductCard } from '@/components/public/ProductCard';
import { products } from '@/data/products';
import { ChevronLeft, ChevronRight, Instagram, Facebook } from 'lucide-react';

const heroImages = [
    'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=1600',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1600',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600'
];

export default function HomePage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    const topProducts = products.slice(0, 3);

    return (
        <div className="min-h-screen">
            {/* Hero Section with Carousel */}
            <section className="relative h-[500px] md:h-[600px] overflow-hidden">
                {heroImages.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <Image
                            src={image}
                            alt={`Slide ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
                    </div>
                ))}

                {/* Hero Content */}
                <div className="relative z-10 h-full flex items-center">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="max-w-[600px]">
                            <h1 className="font-['Inter'] font-semibold text-[32px] md:text-[48px] leading-tight text-white mb-4">
                                Unvergessliche Events für Groß und Klein
                            </h1>
                            <p className="font-['Inter'] text-[16px] md:text-[18px] leading-[25.6px] text-white mb-8">
                                Hüpfburgen und Eventmodule für Ihre Feier. Einfach buchen, sicher aufbauen, Spaß haben.
                            </p>
                            <Link href="/produkte">
                                <Button variant="primary">Jetzt entdecken</Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Carousel Controls */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                >
                    <ChevronLeft className="text-[#1a3a52]" size={24} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                >
                    <ChevronRight className="text-[#1a3a52]" size={24} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Top Products Section */}
            <section className="py-16 bg-white">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-['Inter'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-4 text-center">
                        Beliebte Produkte
                    </h2>
                    <p className="font-['Inter'] text-[16px] text-[#64748b] mb-12 text-center max-w-[600px] mx-auto">
                        Entdecken Sie unsere beliebtesten Hüpfburgen und Eventmodule
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topProducts.map(product => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link href="/produkte">
                            <Button variant="secondary">Alle Produkte ansehen</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-[#e2e8f0]">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-['Inter'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-12 text-center">
                        So funktioniert&apos;s
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-[8px] p-8 border border-[#cbd5e1] text-center">
                            <div className="w-16 h-16 bg-[#fbbf24] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="font-['Inter'] font-semibold text-[24px] text-[#1a3a52]">1</span>
                            </div>
                            <h3 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-2">
                                Produkt auswählen
                            </h3>
                            <p className="font-['Inter'] text-[14px] text-[#4a5568] leading-[20px]">
                                Stöbern Sie durch unsere Auswahl und wählen Sie das passende Produkt für Ihr Event
                            </p>
                        </div>

                        <div className="bg-white rounded-[8px] p-8 border border-[#cbd5e1] text-center">
                            <div className="w-16 h-16 bg-[#fbbf24] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="font-['Inter'] font-semibold text-[24px] text-[#1a3a52]">2</span>
                            </div>
                            <h3 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-2">
                                Datum wählen
                            </h3>
                            <p className="font-['Inter'] text-[14px] text-[#4a5568] leading-[20px]">
                                Prüfen Sie die Verfügbarkeit und wählen Sie Ihr Wunschdatum
                            </p>
                        </div>

                        <div className="bg-white rounded-[8px] p-8 border border-[#cbd5e1] text-center">
                            <div className="w-16 h-16 bg-[#fbbf24] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="font-['Inter'] font-semibold text-[24px] text-[#1a3a52]">3</span>
                            </div>
                            <h3 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-2">
                                Anfrage senden
                            </h3>
                            <p className="font-['Inter'] text-[14px] text-[#4a5568] leading-[20px]">
                                Senden Sie Ihre Buchungsanfrage und wir melden uns zeitnah bei Ihnen
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Section */}
            <section className="py-16 bg-white">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-['Inter'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-4">
                                Standort & Abholung
                            </h2>
                            <p className="font-['Inter'] text-[16px] text-[#4a5568] leading-[25.6px] mb-6">
                                Wir liefern im Umkreis von 50km oder Sie holen bei uns ab. Unser Lager befindet sich in Musterstadt und ist gut erreichbar.
                            </p>
                            <div className="space-y-3">
                                <p className="font-['Inter'] text-[14px] text-[#2d3748]">
                                    <strong>Adresse:</strong> Musterstraße 123, 12345 Musterstadt
                                </p>
                                <p className="font-['Inter'] text-[14px] text-[#2d3748]">
                                    <strong>Öffnungszeiten:</strong> Mo-Fr 9-18 Uhr, Sa 10-14 Uhr
                                </p>
                            </div>
                        </div>
                        <div className="bg-[#e2e8f0] rounded-[8px] h-[300px] flex items-center justify-center border border-[#cbd5e1]">
                            <p className="font-['Inter'] text-[14px] text-[#64748b]">Google Maps Platzhalter</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Media Section */}
            <section className="py-16 bg-[#e2e8f0]">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-['Inter'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-4 text-center">
                        Folgen Sie uns
                    </h2>
                    <p className="font-['Inter'] text-[16px] text-[#64748b] mb-8 text-center">
                        Sehen Sie Impressionen von unseren Events auf Instagram und Facebook
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative bg-white rounded-[8px] aspect-square border border-[#cbd5e1]">
                                <Image
                                    src={`https://images.unsplash.com/photo-${i === 1 ? '1530103043960-ef38714abb15' : i === 2 ? '1587654780291-39c9404d746b' : i === 3 ? '1492684223066-81342ee5ff30' : '1518199266791-5375a83190b7'}?w=400`}
                                    alt={`Social ${i}`}
                                    fill
                                    className="object-cover rounded-[8px]"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center gap-4">
                        <a href="#" className="flex items-center gap-2 bg-white px-6 py-3 rounded-[8px] border border-[#cbd5e1] hover:border-[#1a3a52] transition-colors">
                            <Instagram size={20} className="text-[#1a3a52]" />
                            <span className="font-['Inter'] font-medium text-[14px] text-[#2d3748]">Instagram</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 bg-white px-6 py-3 rounded-[8px] border border-[#cbd5e1] hover:border-[#1a3a52] transition-colors">
                            <Facebook size={20} className="text-[#1a3a52]" />
                            <span className="font-['Inter'] font-medium text-[14px] text-[#2d3748]">Facebook</span>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
