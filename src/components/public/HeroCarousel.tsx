"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        <section className="relative h-[460px] sm:h-[520px] md:h-[600px] overflow-hidden">
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
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 via-transparent to-yellow-400/30" />
                        <div className="absolute inset-0 bg-gradient-to-t from-red-600/60 to-transparent opacity-80" />
                    </div>
                ))
            ) : (
                <div
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(circle at top left, #FFeb3b 0%, #FF5722 100%)" }}
                />
            )}

            <div className="relative z-10 h-full flex items-center">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-[700px] text-center md:text-left mx-auto md:mx-0">
                        {noticeText && (
                            <div className="mb-4 sm:mb-6 inline-block transform -rotate-2">
                                <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="inline-flex rounded-full border-4 border-yellow-300 bg-red-500 px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-lg md:text-xl font-bold text-yellow-300 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                                    🎈 {noticeText} 🎈
                                </span>
                            </div>
                        )}
                        <h1 
                            style={{ fontFamily: 'var(--font-fredoka), sans-serif', textShadow: '3px 3px 0px #e11d48, 6px 6px 0px rgba(0,0,0,0.15)' }} 
                            className="text-[clamp(2.05rem,8.8vw,3rem)] md:text-[64px] lg:text-[76px] leading-[1.05] text-white tracking-wide mb-4 sm:mb-6"
                        >
                            {title}
                        </h1>
                        <p className="font-['Nunito'] font-bold text-[15px] sm:text-[18px] md:text-[22px] leading-[1.5] text-white tracking-wide mb-6 sm:mb-8 drop-shadow-md">
                            {text}
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <Link href="/produkte">
                                <button style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="w-full sm:w-auto bg-yellow-400 text-red-600 border-4 border-white text-base sm:text-xl md:text-2xl px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold shadow-[0_6px_0_#FFF,0_12px_15px_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-[0_2px_0_#FFF,0_6px_10px_rgba(0,0,0,0.2)] transition-all">
                                    🥳 Jetzt entdecken!
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom wave decoration overlaying the carousel */}
            <div className="absolute bottom-0 left-0 right-0 z-20 w-full overflow-hidden leading-none">
                <svg className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.15,192.27,108.83,235.15,98.81,278.4,79.91,321.39,56.44Z" className="fill-[#fefce8]"></path>
                </svg>
            </div>

            {showCarouselControls && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full transition-colors"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="text-[#1a3a52]" size={20} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full transition-colors"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="text-[#1a3a52]" size={20} />
                    </button>

                    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
