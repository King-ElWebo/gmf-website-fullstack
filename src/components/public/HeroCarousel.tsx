"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PartyPopper, Sparkles } from "lucide-react";

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

function getHeroImageCropClass(url: string | null, index: number) {
    if (url?.includes("3bcb0a7c")) {
        return "object-[56%_center] sm:object-[50%_49%] lg:object-[50%_52%]";
    }

    if (url?.includes("9f830a8c")) {
        return "object-[57%_center] sm:object-[50%_56%] lg:object-[50%_58%]";
    }

    if (url?.includes("38e679f1")) {
        return "object-[48%_center] sm:object-[50%_58%] lg:object-[50%_61%]";
    }

    return index % 2 === 0
        ? "object-[56%_center] sm:object-[50%_52%]"
        : "object-[50%_center] sm:object-[50%_56%]";
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
        <section className="relative overflow-hidden bg-[#102b3f] flex flex-col min-h-[460px] h-[60vh] max-h-[750px] sm:min-h-[500px] sm:h-[65vh]">
            {activeImage ? (
                <div key={`${activeImage.url}-${currentSlide}`} className="absolute inset-0">
                    <Image
                        src={activeImage.url}
                        alt={activeImage.alt ?? `Slide ${currentSlide + 1}`}
                        fill
                        className={`object-cover ${getHeroImageCropClass(activeImage.url, currentSlide)}`}
                        priority={currentSlide === 0}
                        fetchPriority={currentSlide === 0 ? "high" : "auto"}
                        quality={68}
                        sizes="100vw"
                    />
                    {/* Elegant, strong gradient from left to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a29]/90 via-[#0a1a29]/50 to-transparent w-full md:w-[85%]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a29]/60 via-transparent to-[#fff7c2]/5" />
                </div>
            ) : (
                <div
                    className="absolute inset-0 bg-gradient-to-tr from-[#1a3a52] to-[#0f2535]"
                />
            )}

            {/* Wave shape transition at the bottom of the Hero section */}
            <div className="absolute bottom-[-4px] left-[-2px] right-[-2px] z-20 pointer-events-none translate-y-[2px]">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto min-h-[24px] sm:min-h-[40px] block scale-y-[1.1] origin-bottom translate-y-[1px]">
                    <path d="M0,96 L120,85.3 C240,75,480,53,720,58.7 C960,64,1200,96,1320,96 L1440,96 L1440,120 L1320,120 C1200,120,960,120,720,120 C480,120,240,120,120,120 L0,120 Z" fill="#fffdf8" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-1 flex-col justify-center">
                <div className="mx-auto flex w-full max-w-[1280px] flex-col justify-center px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
                    <div className="relative w-full max-w-[800px] text-center md:ml-[clamp(1rem,4vw,3rem)] md:text-left">
                        <div className="relative">
                            {noticeText && (
                                <div className="mb-3 inline-flex sm:mb-6">
                                    <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="inline-flex max-w-[290px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-center text-[10px] font-bold uppercase leading-tight tracking-widest text-[#fcd01b] shadow-md backdrop-blur-md sm:max-w-none sm:px-5 sm:py-2 sm:text-[13px]">
                                        <Sparkles size={16} className="shrink-0 text-[#fcd01b]" />
                                        {noticeText}
                                    </span>
                                </div>
                            )}
                            <h1
                                style={{ fontFamily: '"Arial Black", Impact, var(--font-fredoka), sans-serif' }}
                                className="hero-title-heading mb-4 flex max-w-[760px] flex-wrap justify-center font-black uppercase leading-[1.05] tracking-normal sm:mb-8 sm:leading-[0.95] md:justify-start"
                            >
                                {renderPlayfulTitle(title)}
                            </h1>
                            <p className="mx-auto mb-6 max-w-[650px] font-['Nunito'] text-[16px] font-extrabold leading-[1.65] text-white drop-shadow-md sm:mb-10 sm:text-[20px] md:mx-0 md:text-[22px]">
                                {text}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                                <Link
                                    href="/produkte"
                                    style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
                                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/40 bg-gradient-to-r from-[#fcd01b] via-[#ffb23f] to-[#ff7a3d] px-5 py-2 text-[14px] font-bold text-[#332600] shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/40 active:scale-[0.97] sm:min-h-[52px] sm:px-8 sm:text-[18px]"
                                >
                                    <PartyPopper size={19} className="shrink-0" />
                                    Jetzt entdecken
                                    <ChevronRight size={20} className="shrink-0 stroke-[3]" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {showCarouselControls && (
                <>
                    <button
                        onClick={prevSlide}
                        className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-[transform,background-color] duration-150 ease-out-strong hover:bg-white active:scale-95 transform-gpu"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="text-[#1a3a52]" size={20} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-[transform,background-color] duration-150 ease-out-strong hover:bg-white active:scale-95 transform-gpu"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="text-[#1a3a52]" size={20} />
                    </button>

                    <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full border border-white/20 bg-black/20 px-2.5 py-1 shadow-md backdrop-blur-md sm:bottom-9 sm:px-4 sm:py-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className="flex h-4 min-w-4 items-center justify-center rounded-full transition-transform duration-150 ease-out-strong active:scale-90 sm:h-6 sm:min-w-6"
                            >
                                <span
                                    className={`h-2 rounded-full transition-all duration-300 ease-out-strong sm:h-3 ${index === currentSlide ? "w-6 bg-[#fcd01b] sm:w-10" : "w-2 bg-white/50 hover:bg-white/80 sm:w-3"}`}
                                />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
