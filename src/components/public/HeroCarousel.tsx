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
        <section className="relative h-[390px] sm:h-[540px] md:h-[620px] overflow-hidden">
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
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1a3a52]/65 via-transparent to-[#fcd01b]/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f2535]/90 via-[#1a3a52]/35 to-transparent" />
                </div>
            ) : (
                <div
                    className="absolute inset-0 bg-gradient-to-tr from-[#1a3a52] to-[#0f2535]"
                />
            )}

            {/* Ambient design glow circles */}
            <div className="absolute left-[-10%] top-[10%] w-[450px] h-[450px] rounded-full bg-[#ff7a3d]/20 blur-[120px] pointer-events-none z-0" />
            <div className="absolute right-[-10%] bottom-[15%] w-[450px] h-[450px] rounded-full bg-[#fcd01b]/12 blur-[120px] pointer-events-none z-0" />

            {/* Subtile micro-animated decorations (Desktop-only) */}
            <div className="hidden md:block absolute left-[4%] top-[14%] text-4xl animate-bounce pointer-events-none select-none z-20 opacity-85" style={{ animationDuration: '4s' }}>🎈</div>
            <div className="hidden md:block absolute left-[8%] bottom-[24%] text-3xl animate-pulse pointer-events-none select-none z-20 opacity-75">⭐️</div>
            <div className="hidden md:block absolute right-[10%] top-[18%] text-3xl animate-pulse pointer-events-none select-none z-20 opacity-75">✨</div>
            <div className="hidden md:block absolute right-[6%] bottom-[28%] text-4xl animate-bounce pointer-events-none select-none z-20 opacity-85" style={{ animationDuration: '5.5s' }}>🎉</div>

            {/* Wave shape transition at the bottom of the Hero section */}
            <div className="absolute bottom-[-4px] left-[-2px] right-[-2px] z-20 pointer-events-none translate-y-[2px]">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto min-h-[24px] sm:min-h-[40px] block scale-y-[1.1] origin-bottom translate-y-[1px]">
                    <path d="M0,96 L120,85.3 C240,75,480,53,720,58.7 C960,64,1200,96,1320,96 L1440,96 L1440,120 L1320,120 C1200,120,960,120,720,120 C480,120,240,120,120,120 L0,120 Z" fill="#fffdf8" />
                </svg>
            </div>

            <div className="relative z-10 h-full flex items-center pb-14 sm:pb-0">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="w-full text-center md:text-left">
                        {noticeText && (
                            <div className="mb-3 sm:mb-6 inline-block transform -rotate-1">
                                <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="inline-flex rounded-full bg-gradient-to-r from-[#f13c20] to-[#ff7a3d] px-3.5 sm:px-6 py-1 sm:py-2 text-[10px] sm:text-base md:text-lg font-bold text-white shadow-xl shadow-red-500/40 border border-white/10 max-w-[280px] sm:max-w-none text-center justify-center leading-tight">
                                    🎈 {noticeText} 🎈
                                </span>
                            </div>
                        )}
                        <h1
                            style={{ fontFamily: '"Arial Black", Impact, var(--font-fredoka), sans-serif' }}
                            className="mb-3 flex w-full max-w-[1120px] flex-wrap justify-center text-[clamp(1.4rem,7vw,2.2rem)] sm:text-[clamp(2rem,8.6vw,3.25rem)] font-black uppercase leading-[1.05] sm:leading-[0.88] tracking-normal sm:mb-5 md:justify-start md:text-[70px] lg:text-[70px]"
                        >
                            {renderPlayfulTitle(title)}
                        </h1>
                        <p className="hidden sm:block mx-auto max-w-[760px] font-['Nunito'] font-bold text-[13px] leading-relaxed tracking-wide text-white/95 drop-shadow-md sm:text-[18px] md:text-[22px] mb-5 sm:mb-6 md:mb-8 md:mx-0">
                            {text}
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-0">
                            <Link href="/produkte">
                                <button style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="gmf-pulse-glow w-auto bg-gradient-to-r from-[#fcd01b] to-[#ff7a3d] text-[#332600] text-sm sm:text-xl px-6 py-2.5 sm:px-10 sm:py-4 rounded-full font-bold shadow-xl shadow-orange-500/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-200 active:scale-[0.97] transform-gpu border border-white/20">
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

                    <div className="absolute bottom-5 sm:bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-1 sm:gap-1.5 sm:bg-[#1a3a52]/80 sm:backdrop-blur-sm sm:px-4 sm:py-2 rounded-full sm:border sm:border-white/10 sm:shadow-lg sm:shadow-black/15">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className="flex h-4 min-w-4 sm:h-6 sm:min-w-6 items-center justify-center rounded-full active:scale-90 transition-transform duration-150 ease-out-strong transform-gpu"
                            >
                                <span
                                    className={`h-1.5 sm:h-2.5 rounded-full transition-all duration-300 ease-out-strong ${index === currentSlide ? "w-5 sm:w-7 bg-gradient-to-r from-[#fcd01b] to-[#ff7a3d] shadow-md shadow-yellow-500/40" : "w-1.5 sm:w-2.5 bg-white/50 hover:bg-white/70"}`}
                                />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

