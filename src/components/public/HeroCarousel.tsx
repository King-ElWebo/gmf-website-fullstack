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

const heroTitleColors = [
    "#ef2f2f",
    "#45b854",
    "#ffe431",
    "#29aee4",
    "#d43ca5",
    "#ff7a3d",
    "#f66fae",
];

function renderPlayfulTitle(title: string) {
    return title.trim().split(/\s+/).map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="mr-[0.22em] inline-flex whitespace-nowrap">
            {Array.from(word).map((letter, letterIndex) => {
                const color = heroTitleColors[(wordIndex + letterIndex) % heroTitleColors.length];
                const rotation = ((wordIndex + letterIndex) % 5) - 2;

                return (
                    <span
                        key={`${letter}-${letterIndex}`}
                        className="hero-title-letter inline-block"
                        style={{
                            color,
                            transform: `rotate(${rotation}deg)`,
                        }}
                    >
                        {letter}
                    </span>
                );
            })}
        </span>
    ));
}

export function HeroCarousel({ images = [], title, text, noticeText }: HeroCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const activeImage = images[currentSlide] ?? null;

    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 12000);

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
        <section className="relative h-[460px] sm:h-[540px] md:h-[620px] overflow-hidden">
            {activeImage ? (
                <div key={`${activeImage.url}-${currentSlide}`} className="absolute inset-0">
                    <Image
                        src={activeImage.url}
                        alt={activeImage.alt ?? `Slide ${currentSlide + 1}`}
                        fill
                        className="object-cover"
                        priority={currentSlide === 0}
                        fetchPriority={currentSlide === 0 ? "high" : "auto"}
                        quality={68}
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1a3a52]/50 via-transparent to-[#fcd01b]/15" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                </div>
            ) : (
                <div
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(circle at top left, #FFeb3b 0%, #FF5722 100%)" }}
                />
            )}

            <div className="relative z-10 h-full flex items-center">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="mx-auto w-full max-w-[1180px] text-center md:text-left">
                        {noticeText && (
                            <div className="mb-5 sm:mb-7 inline-block transform -rotate-2">
                                <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="inline-flex rounded-full bg-gradient-to-r from-[#f13c20] to-[#ff7a3d] px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-lg md:text-xl font-bold text-white shadow-xl shadow-red-500/40 border border-white/10">
                                    🎈 {noticeText} 🎈
                                </span>
                            </div>
                        )}
                        <h1
                            style={{ fontFamily: '"Arial Black", Impact, var(--font-fredoka), sans-serif' }}
                            className="mb-4 flex w-full max-w-[1120px] flex-wrap justify-center text-[clamp(2rem,8.6vw,3.25rem)] font-black uppercase leading-[0.88] tracking-normal sm:mb-6 md:justify-start md:text-[70px] lg:text-[70px]"
                        >
                            {renderPlayfulTitle(title)}
                        </h1>
                        <p className="mx-auto max-w-[860px] font-['Nunito'] font-bold text-[15px] leading-[1.5] tracking-wide text-white drop-shadow-md sm:mb-8 sm:text-[18px] md:mx-0 md:text-[22px]">
                            {text}
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-7 sm:mt-2">
                            <Link href="/produkte">
                                <button style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="gmf-pulse-glow w-full sm:w-auto bg-gradient-to-r from-[#fcd01b] to-[#ff7a3d] text-[#332600] text-base sm:text-xl md:text-2xl px-10 py-4 rounded-full font-bold shadow-xl shadow-orange-500/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-200 active:scale-[0.97] transform-gpu border border-white/20">
                                    🥳 Jetzt entdecken!
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>



            {showCarouselControls && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 sm:left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-[transform,background-color] duration-150 ease-out-strong hover:bg-white active:scale-95 transform-gpu"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="text-[#1a3a52]" size={20} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 sm:right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-[transform,background-color] duration-150 ease-out-strong hover:bg-white active:scale-95 transform-gpu"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="text-[#1a3a52]" size={20} />
                    </button>

                    <div className="absolute bottom-4 sm:bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-1">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className="flex h-12 min-w-12 items-center justify-center rounded-full active:scale-90 transition-transform duration-150 ease-out-strong transform-gpu"
                            >
                                <span
                                    className={`h-2.5 rounded-full transition-all duration-300 ease-out-strong ${index === currentSlide ? "w-9 bg-gradient-to-r from-[#fcd01b] to-[#ff7a3d] shadow-md shadow-yellow-500/40" : "w-2.5 bg-white/40 hover:bg-white/60"}`}
                                />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

