"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/public/Button";

type CarouselImage = {
    url: string;
    alt: string | null;
};

type HeroCarouselProps = {
    images?: CarouselImage[];
    title: string;
    text: string;
    noticeText?: string | null;
};

export function HeroCarousel({ images = [], title, text, noticeText }: HeroCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [images.length]);

    const showCarouselControls = images.length > 1;

    const nextSlide = () => {
        if (!showCarouselControls) return;
        setCurrentSlide((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        if (!showCarouselControls) return;
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <section className="relative h-[500px] md:h-[600px] overflow-hidden">
            {images.length > 0 ? (
                images.map((image, index) => (
                    <div
                        key={`${image.url}-${index}`}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
                    >
                        <Image
                            src={image.url}
                            alt={image.alt ?? `Slide ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-black/45 to-black/35" />
                    </div>
                ))
            ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,196,61,0.3),_transparent_25%),linear-gradient(135deg,_#17324A_0%,_#0F1E2C_100%)]" />
            )}

            <div className="relative z-10 h-full flex items-center">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-[620px]">
                        <h1 className="font-['Inter'] font-semibold text-[32px] md:text-[56px] leading-[1.1] text-white mb-4">
                            {title}
                        </h1>
                        <p className="font-['Inter'] text-[16px] md:text-[18px] leading-[1.6] text-white mb-8">
                            {text}
                        </p>
                        {noticeText && (
                            <p className="mb-6 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                                {noticeText}
                            </p>
                        )}
                        <div>
                            <Link href="/produkte">
                                <Button variant="primary">Jetzt entdecken</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {showCarouselControls && (
                <>
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
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-8" : "bg-white/50"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
