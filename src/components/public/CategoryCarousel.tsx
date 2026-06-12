'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CategoryCard = {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    slug: string;
    catalogTypeName: string;
    catalogTypeSlug: string;
};

function getItemsPerView(width: number): number {
    if (width < 768) return 1;
    if (width < 1100) return 2;
    return 3;
}

export function CategoryCarousel({ categories }: { categories: CategoryCard[] }) {
    const [itemsPerView, setItemsPerView] = useState(3);
    const [currentIndex, setCurrentIndex] = useState(categories.length);
    const [withTransition, setWithTransition] = useState(true);

    const isJumping = useRef(false);
    const touchStart = useRef<number | null>(null);
    const categoryCount = categories.length;

    const extended = useMemo(() => {
        if (categoryCount === 0) return [];
        return [...categories.slice(-categoryCount), ...categories, ...categories.slice(0, categoryCount)];
    }, [categories, categoryCount]);

    const total = extended.length;

    useEffect(() => {
        const onResize = () => setItemsPerView(getItemsPerView(window.innerWidth));
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        setCurrentIndex(categoryCount);
    }, [categoryCount]);

    const navigate = useCallback((dir: 1 | -1) => {
        if (isJumping.current || categoryCount <= 1) return;
        isJumping.current = true;
        setWithTransition(true);
        setCurrentIndex((prev) => prev + dir);
    }, [categoryCount]);

    const onTransitionEnd = useCallback(() => {
        setCurrentIndex((prev) => {
            if (prev >= categoryCount + categoryCount) {
                setWithTransition(false);
                return prev - categoryCount;
            }

            if (prev < categoryCount) {
                setWithTransition(false);
                return prev + categoryCount;
            }

            return prev;
        });
        isJumping.current = false;
    }, [categoryCount]);

    useEffect(() => {
        if (!withTransition) {
            const id = requestAnimationFrame(() => {
                requestAnimationFrame(() => setWithTransition(true));
            });
            return () => cancelAnimationFrame(id);
        }
    }, [withTransition]);

    const onTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;
        const delta = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) navigate(delta > 0 ? 1 : -1);
        touchStart.current = null;
    };

    if (categoryCount === 0) return null;

    if (categoryCount <= itemsPerView) {
        return (
            <section className="py-16 sm:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#fffdf8] to-white" />
                <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-14">
                        <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full text-[13px] font-bold uppercase tracking-widest text-[#f13c20] border border-orange-100 shadow-sm mb-6">
                            🎪 Unser Sortiment
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(2rem,7vw,3rem)] text-[#1a3a52] mb-3">
                            Unsere Kategorien
                        </h2>
                        <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#64748b] max-w-[500px] mx-auto">
                            Entdecken Sie unsere große Auswahl an Eventmodulen für Ihre Veranstaltung.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="h-full bg-white rounded-[28px] border border-orange-100/60 shadow-lg shadow-orange-500/5 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col group"
                            >
                                <div className="relative w-full shrink-0 bg-gradient-to-br from-[#fef9e7] to-[#fdf2d1]" style={{ paddingBottom: '62%' }}>
                                    {category.imageUrl ? (
                                        <>
                                            <Image
                                                src={category.imageUrl}
                                                alt={category.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out-strong"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
                                                draggable={false}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a52] to-[#066bb7]" />
                                    )}
                                </div>

                                <div className="p-5 sm:p-7 flex flex-col flex-1">
                                    <div className="mb-3 text-center">
                                        <span className="inline-flex rounded-full bg-gradient-to-r from-[#fef08a] to-[#fde68a] px-4 py-1.5 text-[12px] font-bold text-[#92400e] shadow-sm uppercase tracking-wide border border-yellow-200/50">
                                            {category.catalogTypeName}
                                        </span>
                                    </div>
                                    <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[20px] sm:text-[22px] text-[#1a3a52] mb-2 text-center">
                                        {category.title}
                                    </h3>
                                    <p className="font-['Nunito'] text-[14px] sm:text-[15px] text-[#64748b] leading-[1.6] flex-1 mb-5 sm:mb-6 text-center">
                                        {category.description?.trim() || 'Produkte und Eventmodule aus dieser Kategorie ansehen.'}
                                    </p>
                                    <Link
                                        href={`/produkte?bereich=${encodeURIComponent(category.catalogTypeSlug)}&kategorie=${encodeURIComponent(category.slug)}`}
                                        className="block shrink-0"
                                    >
                                        <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="flex items-center justify-center w-full h-[48px] sm:h-[52px] rounded-full bg-gradient-to-r from-[#f13c20] to-[#ff7a3d] shadow-lg shadow-red-500/25 text-white text-[16px] sm:text-[17px] transition-all duration-200 active:scale-[0.97] transform-gpu hover:shadow-xl hover:shadow-red-500/35 hover:-translate-y-0.5">
                                            Jetzt entdecken 🚀
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    const activeDot = ((currentIndex - categoryCount) % categoryCount + categoryCount) % categoryCount;
    const translatePct = -(currentIndex * (100 / total));

    return (
        <section className="py-16 sm:py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#fffdf8] to-white" />
            <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 sm:mb-14 flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="text-center md:text-left">
                        <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest text-[#f13c20] border border-orange-100 shadow-sm mb-4">
                            🎪 Unser Sortiment
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(2rem,7vw,3rem)] text-[#1a3a52] mb-2">
                            Unsere Kategorien
                        </h2>
                        <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#64748b]">
                            Entdecken Sie unsere große Auswahl an Eventmodulen für Ihre Veranstaltung.
                        </p>
                    </div>
                    <div className="flex gap-3 sm:gap-4 shrink-0 self-center md:self-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="h-11 w-11 rounded-full bg-white border border-orange-100 flex items-center justify-center text-[#f13c20] hover:bg-[#fff4f0] hover:scale-105 active:scale-[0.95] transition-all duration-200 disabled:opacity-30 shadow-md hover:shadow-lg transform-gpu"
                            aria-label="Vorherige Kategorie"
                            disabled={categoryCount <= 1}
                        >
                            <ChevronLeft size={20} className="stroke-[3]" />
                        </button>
                        <button
                            onClick={() => navigate(1)}
                            className="h-11 w-11 rounded-full bg-white border border-orange-100 flex items-center justify-center text-[#f13c20] hover:bg-[#fff4f0] hover:scale-105 active:scale-[0.95] transition-all duration-200 disabled:opacity-30 shadow-md hover:shadow-lg transform-gpu"
                            aria-label="Nächste Kategorie"
                            disabled={categoryCount <= 1}
                        >
                            <ChevronRight size={20} className="stroke-[3]" />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden py-3 -my-3">
                    <div
                        className="flex items-stretch"
                        style={{
                            width: `${(total / itemsPerView) * 100}%`,
                            transform: `translateX(${translatePct}%)`,
                            transition: withTransition ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                        }}
                        onTransitionEnd={onTransitionEnd}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        {extended.map((category, idx) => (
                            <div
                                key={`${category.id}-${idx}`}
                                style={{ width: `${100 / total}%` }}
                                className="px-2 sm:px-3"
                            >
                                <div className="h-full bg-white rounded-[28px] border border-orange-100/60 shadow-lg shadow-orange-500/5 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col group mx-1 sm:mx-2">
                                    <div className="relative w-full shrink-0 bg-gradient-to-br from-[#fef9e7] to-[#fdf2d1]" style={{ paddingBottom: '62%' }}>
                                        {category.imageUrl ? (
                                            <>
                                                <Image
                                                    src={category.imageUrl}
                                                    alt={category.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out-strong"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
                                                    draggable={false}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a52] to-[#066bb7]" />
                                        )}
                                    </div>

                                    <div className="p-5 sm:p-7 flex flex-col flex-1">
                                        <div className="mb-3 text-center">
                                            <span className="inline-flex rounded-full bg-gradient-to-r from-[#fef08a] to-[#fde68a] px-4 py-1.5 text-[12px] font-bold text-[#92400e] shadow-sm uppercase tracking-wide border border-yellow-200/50">
                                                {category.catalogTypeName}
                                            </span>
                                        </div>
                                        <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[20px] sm:text-[22px] text-[#1a3a52] mb-2 text-center">
                                            {category.title}
                                        </h3>
                                        <p className="font-['Nunito'] text-[14px] sm:text-[15px] text-[#64748b] leading-[1.6] flex-1 mb-5 sm:mb-6 text-center">
                                            {category.description?.trim() || 'Produkte und Eventmodule aus dieser Kategorie ansehen.'}
                                        </p>
                                        <Link
                                            href={`/produkte?bereich=${encodeURIComponent(category.catalogTypeSlug)}&kategorie=${encodeURIComponent(category.slug)}`}
                                            className="block shrink-0"
                                        >
                                            <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="flex items-center justify-center w-full h-[48px] sm:h-[52px] rounded-full bg-gradient-to-r from-[#f13c20] to-[#ff7a3d] shadow-lg shadow-red-500/25 text-white text-[16px] sm:text-[17px] transition-all duration-200 active:scale-[0.97] transform-gpu hover:shadow-xl hover:shadow-red-500/35 hover:-translate-y-0.5">
                                                Jetzt entdecken 🚀
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {categoryCount > 1 && (
                    <div className="flex justify-center gap-2 mt-8 sm:mt-12 pb-2">
                        {categories.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setWithTransition(true);
                                    setCurrentIndex(categoryCount + idx);
                                    isJumping.current = false;
                                }}
                                aria-label={`Kategorie ${idx + 1}`}
                                className="flex h-10 min-w-10 items-center justify-center rounded-full"
                            >
                                <span
                                    className={`rounded-full transition-all duration-300 ease-out-strong ${activeDot === idx ? 'h-3 w-8 bg-gradient-to-r from-[#f13c20] to-[#ff7a3d] shadow-md shadow-red-500/30' : 'h-3 w-3 bg-orange-200 hover:bg-orange-300'}`}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
