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
            <section className="py-14 sm:py-20 relative bg-white">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(1.85rem,8vw,2.6rem)] text-blue-600 mb-3 sm:mb-4 drop-shadow-sm">
                            Unsere Kategorien
                        </h2>
                        <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#64748b]">
                            Entdecken Sie unsere große Auswahl an Eventmodulen für Ihre Veranstaltung.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="h-full bg-white rounded-[32px] border-4 border-blue-200 shadow-[6px_6px_0_#bfdbfe] hover:shadow-[8px_8px_0_#60a5fa] hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col group"
                            >
                                <div className="relative w-full shrink-0 bg-[#fef9c3]" style={{ paddingBottom: '62%' }}>
                                    {category.imageUrl ? (
                                        <>
                                            <Image
                                                src={category.imageUrl}
                                                alt={category.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
                                                draggable={false}
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1a3a52,#3f6a8f)]" />
                                    )}
                                </div>

                                <div className="p-5 sm:p-8 flex flex-col flex-1 bg-[#f8fafc]">
                                    <div className="mb-4 text-center">
                                        <span className="inline-flex rounded-full bg-yellow-300 px-4 py-1 text-[13px] font-bold text-red-600 shadow-sm border-2 border-yellow-400 uppercase tracking-wide">
                                            {category.catalogTypeName}
                                        </span>
                                    </div>
                                    <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[20px] sm:text-[24px] text-[#1e293b] mb-2 sm:mb-3 text-center">
                                        {category.title}
                                    </h3>
                                    <p className="font-['Nunito'] text-[14px] sm:text-[15px] text-[#64748b] leading-[22px] flex-1 mb-6 sm:mb-8 text-center">
                                        {category.description?.trim() || 'Produkte und Eventmodule aus dieser Kategorie ansehen.'}
                                    </p>
                                    <Link
                                        href={`/produkte?bereich=${encodeURIComponent(category.catalogTypeSlug)}&kategorie=${encodeURIComponent(category.slug)}`}
                                        className="block shrink-0"
                                    >
                                        <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="flex items-center justify-center w-full h-[48px] sm:h-[54px] rounded-full bg-red-500 border-b-4 border-red-700 text-white text-[16px] sm:text-[18px] transition-all hover:bg-red-400 hover:border-red-600 focus:outline-none">
                                            Entdecken! 🚀
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
        <section className="py-14 sm:py-20 relative bg-white">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 sm:mb-12 flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="text-center md:text-left">
                        <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(1.85rem,8vw,2.6rem)] text-blue-600 mb-3 sm:mb-4 drop-shadow-sm">
                            Unsere Kategorien
                        </h2>
                        <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#64748b]">
                            Entdecken Sie unsere große Auswahl an Eventmodulen für Ihre Veranstaltung.
                        </p>
                    </div>
                    <div className="flex gap-3 sm:gap-4 shrink-0 self-center md:self-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="h-12 w-12 rounded-full border-4 border-yellow-400 bg-yellow-300 flex items-center justify-center text-red-600 hover:bg-yellow-400 hover:scale-110 transition-transform disabled:opacity-30 shadow-[0_4px_0_#facc15]"
                            aria-label="Vorherige Kategorie"
                            disabled={categoryCount <= 1}
                        >
                            <ChevronLeft size={20} className="stroke-[3]" />
                        </button>
                        <button
                            onClick={() => navigate(1)}
                            className="h-12 w-12 rounded-full border-4 border-yellow-400 bg-yellow-300 flex items-center justify-center text-red-600 hover:bg-yellow-400 hover:scale-110 transition-transform disabled:opacity-30 shadow-[0_4px_0_#facc15]"
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
                                <div className="h-full bg-white rounded-[32px] border-4 border-blue-200 shadow-[6px_6px_0_#bfdbfe] hover:shadow-[8px_8px_0_#60a5fa] hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col group mx-1 sm:mx-2">
                                    <div className="relative w-full shrink-0 bg-[#fef9c3]" style={{ paddingBottom: '62%' }}>
                                        {category.imageUrl ? (
                                            <>
                                                <Image
                                                    src={category.imageUrl}
                                                    alt={category.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
                                                    draggable={false}
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 bg-[linear-gradient(135deg,#1a3a52,#3f6a8f)]" />
                                        )}
                                    </div>

                                    <div className="p-5 sm:p-8 flex flex-col flex-1 bg-[#f8fafc]">
                                        <div className="mb-4 text-center">
                                            <span className="inline-flex rounded-full bg-yellow-300 px-4 py-1 text-[13px] font-bold text-red-600 shadow-sm border-2 border-yellow-400 uppercase tracking-wide">
                                                {category.catalogTypeName}
                                            </span>
                                        </div>
                                        <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[20px] sm:text-[24px] text-[#1e293b] mb-2 sm:mb-3 text-center">
                                            {category.title}
                                        </h3>
                                        <p className="font-['Nunito'] text-[14px] sm:text-[15px] text-[#64748b] leading-[22px] flex-1 mb-6 sm:mb-8 text-center">
                                            {category.description?.trim() || 'Produkte und Eventmodule aus dieser Kategorie ansehen.'}
                                        </p>
                                        <Link
                                            href={`/produkte?bereich=${encodeURIComponent(category.catalogTypeSlug)}&kategorie=${encodeURIComponent(category.slug)}`}
                                            className="block shrink-0"
                                        >
                                            <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="flex items-center justify-center w-full h-[48px] sm:h-[54px] rounded-full bg-red-500 border-b-4 border-red-700 text-white text-[16px] sm:text-[18px] transition-all hover:bg-red-400 hover:border-red-600 focus:outline-none">
                                                Entdecken! 🚀
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {categoryCount > 1 && (
                    <div className="flex justify-center gap-[6px] mt-6 sm:mt-8">
                        {categories.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setWithTransition(true);
                                    setCurrentIndex(categoryCount + idx);
                                    isJumping.current = false;
                                }}
                                aria-label={`Kategorie ${idx + 1}`}
                                className="flex h-12 min-w-12 items-center justify-center rounded-full"
                            >
                                <span
                                    className={`rounded-full transition-all duration-300 border-2 border-white shadow-sm ${activeDot === idx ? 'h-4 w-8 bg-red-500' : 'h-4 w-4 bg-blue-300 hover:bg-blue-400'}`}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
