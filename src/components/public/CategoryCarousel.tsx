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
            <section className="py-16" style={{ backgroundColor: '#FFFfff' }}>
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-['Inter'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-4">
                            Unsere Kategorien
                        </h2>
                        <p className="font-['Inter'] text-[16px] text-[#64748b]">
                            Entdecken Sie unsere große Auswahl an Eventmodulen für Ihre Veranstaltung.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="h-full bg-white rounded-[8px] border border-[#cbd5e1] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="relative w-full shrink-0 bg-[#e2e8f0]" style={{ paddingBottom: '62%' }}>
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

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="mb-3">
                                        <span className="inline-flex rounded-full bg-[#f7f8fa] px-3 py-1 text-[12px] font-medium text-[#1a3a52]">
                                            {category.catalogTypeName}
                                        </span>
                                    </div>
                                    <h3 className="font-['Inter'] font-semibold text-[18px] text-[#1a202c] mb-2">
                                        {category.title}
                                    </h3>
                                    <p className="font-['Inter'] text-[14px] text-[#64748b] leading-[22px] flex-1 mb-6">
                                        {category.description?.trim() || 'Produkte und Eventmodule aus dieser Kategorie ansehen.'}
                                    </p>
                                    <Link
                                        href={`/produkte?bereich=${encodeURIComponent(category.catalogTypeSlug)}&kategorie=${encodeURIComponent(category.slug)}`}
                                        className="block shrink-0"
                                    >
                                        <span className="flex items-center justify-center w-full h-[48px] rounded-[8px] bg-[#1a3a52] text-white font-['Inter'] font-medium text-[16px] hover:opacity-90 transition-opacity">
                                            Produkte ansehen
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
        <section className="py-16" style={{ backgroundColor: '#FFFfff' }}>
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-12">
                    <div className="w-[83px] shrink-0" />
                    <div className="text-center">
                        <h2 className="font-['Inter'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-4">
                            Unsere Kategorien
                        </h2>
                        <p className="font-['Inter'] text-[16px] text-[#64748b]">
                            Entdecken Sie unsere große Auswahl an Eventmodulen für Ihre Veranstaltung.
                        </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full border border-[#cbd5e1] bg-[#FFEC8B] flex items-center justify-center text-[#1a202c] hover:bg-[#1a3a52] hover:text-white hover:border-[#1a3a52] transition-colors disabled:opacity-50"
                            aria-label="Vorherige Kategorie"
                            disabled={categoryCount <= 1}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => navigate(1)}
                            className="w-10 h-10 rounded-full border border-[#cbd5e1] bg-[#FFEC8B] flex items-center justify-center text-[#1a202c] hover:bg-[#1a3a52] hover:text-white hover:border-[#1a3a52] transition-colors disabled:opacity-50"
                            aria-label="Nächste Kategorie"
                            disabled={categoryCount <= 1}
                        >
                            <ChevronRight size={20} />
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
                                className="px-3"
                            >
                                <div className="h-full bg-white rounded-[8px] border border-[#cbd5e1] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group hover:shadow-md transition-shadow duration-300">
                                    <div className="relative w-full shrink-0 bg-[#e2e8f0]" style={{ paddingBottom: '62%' }}>
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

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="mb-3">
                                            <span className="inline-flex rounded-full bg-[#f7f8fa] px-3 py-1 text-[12px] font-medium text-[#1a3a52]">
                                                {category.catalogTypeName}
                                            </span>
                                        </div>
                                        <h3 className="font-['Inter'] font-semibold text-[18px] text-[#1a202c] mb-2">
                                            {category.title}
                                        </h3>
                                        <p className="font-['Inter'] text-[14px] text-[#64748b] leading-[22px] flex-1 mb-6">
                                            {category.description?.trim() || 'Produkte und Eventmodule aus dieser Kategorie ansehen.'}
                                        </p>
                                        <Link
                                            href={`/produkte?bereich=${encodeURIComponent(category.catalogTypeSlug)}&kategorie=${encodeURIComponent(category.slug)}`}
                                            className="block shrink-0"
                                        >
                                            <span className="flex items-center justify-center w-full h-[48px] rounded-[8px] bg-[#1a3a52] text-white font-['Inter'] font-medium text-[16px] hover:opacity-90 transition-opacity">
                                                Produkte ansehen
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {categoryCount > 1 && (
                    <div className="flex justify-center gap-[6px] mt-8">
                        {categories.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setWithTransition(true);
                                    setCurrentIndex(categoryCount + idx);
                                    isJumping.current = false;
                                }}
                                aria-label={`Kategorie ${idx + 1}`}
                                className={`rounded-full transition-all duration-300 ${activeDot === idx ? 'w-6 h-2 bg-[#1a3a52]' : 'w-2 h-2 bg-[#cbd5e1] hover:bg-[#94a3b8]'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
