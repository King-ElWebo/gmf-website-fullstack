'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export type CategoryCard = {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    slug: string;
    catalogTypeName: string;
    catalogTypeSlug: string;
};

const descriptionClampStyle: React.CSSProperties = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
};

function getItemsPerView(width: number): number {
    if (width < 768) return 1;
    if (width < 1120) return 2;
    return 3;
}

function getCategoryHref(category: CategoryCard) {
    return `/produkte?bereich=${encodeURIComponent(category.catalogTypeSlug)}&kategorie=${encodeURIComponent(category.slug)}`;
}

function CategoryCardView({ category }: { category: CategoryCard }) {
    const description = category.description?.trim() || 'Produkte und Eventmodule aus dieser Kategorie ansehen.';

    return (
        <article className="group mx-auto flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_16px_36px_rgba(26,58,82,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-[#fcd01b]/60 hover:shadow-[0_22px_48px_rgba(26,58,82,0.12)]">
            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#fef9e7] to-[#fdf2d1]">
                {category.imageUrl ? (
                    <>
                        <Image
                            src={category.imageUrl}
                            alt={category.title}
                            fill
                            className="object-cover transition-transform duration-500 ease-out-strong group-hover:scale-[1.04]"
                            sizes="(max-width: 768px) 88vw, (max-width: 1100px) 44vw, 28vw"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#102b3f]/40 via-transparent to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a3a52] to-[#066bb7] px-6 text-center">
                        <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-xl text-white">
                            {category.title}
                        </span>
                    </div>
                )}

                <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#92400e] shadow-md shadow-black/10 backdrop-blur-sm sm:left-4 sm:top-4">
                    {category.catalogTypeName}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
                <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="mb-2 !text-[20px] leading-tight text-[#1a3a52] sm:!text-[24px]">
                    {category.title}
                </h3>
                <p
                    className="mb-5 font-['Nunito'] text-[14px] leading-[1.6] text-[#5f6f7f] sm:mb-6 sm:text-[16px]"
                    style={descriptionClampStyle}
                >
                    {description}
                </p>
                <Link
                    href={getCategoryHref(category)}
                    style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
                    className="mt-auto inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#f13c20] to-[#ff7a3d] px-5 py-3 text-[15px] font-bold text-white shadow-md shadow-red-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.97] sm:min-h-[50px] sm:text-[17px]"
                >
                    Jetzt entdecken
                    <ArrowRight size={20} className="shrink-0 stroke-[3]" />
                </Link>
            </div>
        </article>
    );
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

    const activeDot = ((currentIndex - categoryCount) % categoryCount + categoryCount) % categoryCount;
    const canSlide = categoryCount > itemsPerView;
    const translatePct = total > 0 ? -(currentIndex * (100 / total)) : 0;

    const headerControls = canSlide ? (
        <div className="hidden items-center justify-end md:flex">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f7d99a]/80 bg-white/80 p-1.5 shadow-[0_10px_30px_rgba(26,58,82,0.07)] backdrop-blur-md">
                <button
                    onClick={() => navigate(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f0e3ca] bg-white text-[#1a3a52] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff8e8] active:scale-[0.95] disabled:opacity-30"
                    aria-label="Vorherige Kategorie"
                    disabled={categoryCount <= 1}
                >
                    <ChevronLeft size={20} className="stroke-[2.5]" />
                </button>
                <span className="min-w-10 text-center font-['Nunito'] text-[14px] font-extrabold text-[#1a3a52]">
                    {activeDot + 1}/{categoryCount}
                </span>
                <button
                    onClick={() => navigate(1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f0e3ca] bg-white text-[#1a3a52] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff8e8] active:scale-[0.95] disabled:opacity-30"
                    aria-label="Nächste Kategorie"
                    disabled={categoryCount <= 1}
                >
                    <ChevronRight size={20} className="stroke-[2.5]" />
                </button>
            </div>
        </div>
    ) : null;

    return (
        <section className="relative overflow-hidden bg-[var(--gmf-surface-cream)] pb-10 pt-4 sm:pb-12 sm:pt-9 lg:pb-14 lg:pt-11">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf8_0%,#fffaf0_42%,var(--gmf-surface-cream)_100%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#fcd01b]/45 to-transparent" />

            <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <div className="mb-5 grid gap-4 sm:mb-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <div className="max-w-[640px] text-center md:text-left">
                        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ffd188]/80 bg-[#fff6d9]/95 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#b83216] shadow-sm shadow-orange-500/10 backdrop-blur-sm sm:mb-4 sm:px-5 sm:py-2 sm:text-[12px]">
                            <Sparkles size={15} />
                            Unser Sortiment
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="home-category-heading leading-none text-[#1a3a52]">
                            Unsere Kategorien
                        </h2>
                        <p className="mx-auto mt-3 hidden max-w-[560px] font-['Nunito'] text-[15px] leading-[1.6] text-[#4f6274] sm:block md:mx-0">
                            Entdecken Sie die wichtigsten Bereiche für Hüpfburgen, Eventmodule sowie Licht- und Tontechnik.
                        </p>
                    </div>
                    {headerControls}
                </div>

                {canSlide ? (
                    <>
                        <div className="relative -mx-2 sm:mx-0">
                            <div className="pointer-events-none absolute inset-x-[-10px] bottom-1 top-7 hidden rounded-[36px] border border-[#fff0bd]/80 bg-[linear-gradient(135deg,rgba(255,248,224,0.86)_0%,rgba(252,208,27,0.14)_44%,rgba(255,122,61,0.08)_100%)] sm:block" />
                            <div className="relative overflow-hidden px-1.5 pt-1.5 pb-8 sm:-mx-[10px] sm:px-[22px] sm:pt-5 sm:pb-[52px] -mb-6 sm:-mb-[32px]">
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
                                    {extended.map((category, idx) => {
                                        const isVisible = idx >= currentIndex && idx < currentIndex + itemsPerView;
                                        const visibilityClass = isVisible ? 'sm:opacity-100' : 'sm:opacity-0 sm:pointer-events-none';
                                        return (
                                            <div
                                                key={`${category.id}-${idx}`}
                                                style={{ width: `${100 / total}%` }}
                                                className={`px-2 sm:px-3 ${withTransition ? 'sm:transition-opacity sm:duration-[450ms]' : ''} ${visibilityClass}`}
                                            >
                                                <CategoryCardView category={category} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-center gap-1.5 pb-0 sm:hidden">
                            {categories.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setWithTransition(true);
                                        setCurrentIndex(categoryCount + idx);
                                        isJumping.current = false;
                                    }}
                                    aria-label={`Kategorie ${idx + 1}`}
                                    className="flex h-5 min-w-5 items-center justify-center rounded-full sm:h-6 sm:min-w-6"
                                >
                                    <span
                                        className={`h-1.5 rounded-full transition-all duration-300 ease-out-strong ${activeDot === idx ? 'w-5 bg-gradient-to-r from-[#f13c20] to-[#ff7a3d] sm:w-6' : 'w-1.5 bg-[#1a3a52]/20 hover:bg-[#1a3a52]/40'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-x-[-10px] bottom-1 top-7 hidden rounded-[36px] border border-[#fff0bd]/80 bg-[linear-gradient(135deg,rgba(255,248,224,0.86)_0%,rgba(252,208,27,0.14)_44%,rgba(255,122,61,0.08)_100%)] sm:block" />
                        <div className="relative grid grid-cols-1 gap-4 px-1.5 pt-1.5 pb-8 sm:grid-cols-2 sm:gap-6 sm:px-3 sm:pt-5 sm:pb-[52px] -mb-6 sm:-mb-[32px] lg:grid-cols-3">
                            {categories.map((category) => (
                                <CategoryCardView key={category.id} category={category} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
