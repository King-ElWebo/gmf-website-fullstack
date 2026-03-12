"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/public/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const fallbackImages = [
    { url: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=1600', alt: 'Placeholder image 1' },
    { url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1600', alt: 'Placeholder image 2' },
    { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600', alt: 'Placeholder image 3' },
];

type CarouselImage = {
    url: string;
    alt: string | null;
};

type HeroCarouselProps = {
    images?: CarouselImage[];
};

export function HeroCarousel({ images }: HeroCarouselProps) {
    const activeImages = images && images.length > 0 ? images : fallbackImages;
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (activeImages.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [activeImages.length]);

    if (activeImages.length === 0) {
        return (
            <section className="relative h-[500px] md:h-[600px] bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No images available for the carousel.</p>
            </section>
        );
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % activeImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + activeImages.length) % activeImages.length);
    };

    return (
        <section className="relative h-[500px] md:h-[600px] overflow-hidden">
            {activeImages.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <Image
                        src={image.url}
                        alt={image.alt ?? `Slide ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-black/40 to-black/20" />
                </div>
            ))}

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

            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                aria-label="Previous slide"
            >
                <ChevronLeft className="text-[#1a3a52]" size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                aria-label="Next slide"
            >
                <ChevronRight className="text-[#1a3a52]" size={24} />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {activeImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
