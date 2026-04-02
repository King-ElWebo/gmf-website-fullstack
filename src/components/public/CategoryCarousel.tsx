'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Dummy-Daten ─────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: '1', title: 'Hüpfburgen', description: 'Farbenfrohe Hüpfburgen für unvergesslichen Spaß auf jeder Kinderparty.', imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80', slug: 'huepfburgen' },
    { id: '2', title: 'Rutschbahnen', description: 'Große Riesen-Rutschen für Kinder und Junggebliebene – Nervenkitzel garantiert.', imageUrl: 'https://images.unsplash.com/photo-1605814516246-2495ea7fbaed?auto=format&fit=crop&w=800&q=80', slug: 'rutschbahnen' },
    { id: '3', title: 'Hindernisbahnen', description: 'Kompakte Hindernisparcours für kleine Abenteurer und sportliche Gruppen.', imageUrl: 'https://images.unsplash.com/photo-1549448833-255d64ffca5b?auto=format&fit=crop&w=800&q=80', slug: 'hindernisbahnen' },
    { id: '4', title: 'Licht & Ton', description: 'Professionelles Licht- und Tontechnik-Equipment für die perfekte Partystimmung.', imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80', slug: 'licht-ton' },
    { id: '5', title: 'Spiele & Aktionen', description: 'Riesige Gesellschaftsspiele und Aktivitätsstationen für alle Altersgruppen.', imageUrl: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=800&q=80', slug: 'spiele' },
    { id: '6', title: 'Zelte & Möbel', description: 'Zelte, Bänke, Tische und mehr für den optimalen Komfort Ihrer Gäste.', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80', slug: 'zelte-moebel' },
];

const N = CATEGORIES.length;
// Erweitertes Array: [letztes N] + [Original] + [erstes N] → 3×N Slides total
const EXTENDED = [...CATEGORIES.slice(-N), ...CATEGORIES, ...CATEGORIES.slice(0, N)];
const TOTAL = EXTENDED.length; // 18

function getItemsPerView(width: number): number {
    if (width < 768) return 1;
    if (width < 1100) return 2;
    return 3;
}

export function CategoryCarousel() {
    // itemsPerView: wie viele Cards gleichzeitig sichtbar sind
    const [itemsPerView, setItemsPerView] = useState(3);
    // currentIndex: Zeiger auf den aktuellen ersten sichtbaren Slide im EXTENDED-Array.
    // Startposition = N (erster echter Slide nach dem vorderen Klon-Block).
    const [currentIndex, setCurrentIndex] = useState(N);
    // Steuert die CSS-Transition: aus, wenn wir einen Ghost-Jump machen
    const [withTransition, setWithTransition] = useState(true);

    const isJumping = useRef(false); // verhindert doppelte Navigation während Transition
    const touchStart = useRef<number | null>(null);

    // ── Resize ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const onResize = () => setItemsPerView(getItemsPerView(window.innerWidth));
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // ── Navigation ────────────────────────────────────────────────────────────
    const navigate = useCallback((dir: 1 | -1) => {
        if (isJumping.current) return;
        isJumping.current = true;
        setWithTransition(true);
        setCurrentIndex(prev => prev + dir);
    }, []);

    // ── onTransitionEnd → Infinite-Loop Ghost-Jump ────────────────────────────
    const onTransitionEnd = useCallback(() => {
        setCurrentIndex(prev => {
            // Nach dem vorderen Klon-Block? → springe an echte Position zurück
            if (prev >= N + N) {
                setWithTransition(false);
                return prev - N;
            }
            // Vor dem echten Start? → springe ans Ende des echten Blocks
            if (prev < N) {
                setWithTransition(false);
                return prev + N;
            }
            return prev;
        });
        isJumping.current = false;
    }, []);

    // Nach dem Ghost-Jump (withTransition=false) den Frame rendern lassen,
    // dann Transition wieder einschalten
    useEffect(() => {
        if (!withTransition) {
            const id = requestAnimationFrame(() => {
                requestAnimationFrame(() => setWithTransition(true));
            });
            return () => cancelAnimationFrame(id);
        }
    }, [withTransition]);

    // ── Touch/Swipe ──────────────────────────────────────────────────────────
    const onTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.targetTouches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;
        const delta = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) navigate(delta > 0 ? 1 : -1);
        touchStart.current = null;
    };

    // ── Dot-Indikator: welche echte Kategorie ist gerade aktiv? ───────────────
    const activeDot = ((currentIndex - N) % N + N) % N;

    // ── Translate-Berechnung ─────────────────────────────────────────────────
    // Der flex-Wrapper ist (TOTAL / itemsPerView)*100% breit.
    // Jede Card nimmt (100/TOTAL)% des Wrappers ein.
    // Um `currentIndex` Cards zu verschieben: currentIndex * (100/TOTAL) %.
    const translatePct = -(currentIndex * (100 / TOTAL));

    return (
        <section className="py-16" style={{ backgroundColor: '#FFF9E6' }}>
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header: unsichtbarer Spacer links | zentrierter Text | Pfeile rechts */}
                <div className="flex justify-between items-center mb-12">
                    {/* Spacer – exakt so breit wie die Pfeil-Buttons (2 × w-10 + gap-3 = 83px) */}
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
                            className="w-10 h-10 rounded-full border border-[#cbd5e1] bg-[#FFEC8B] flex items-center justify-center text-[#1a202c] hover:bg-[#1a3a52] hover:text-white hover:border-[#1a3a52] transition-colors"
                            aria-label="Vorherige Kategorie"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => navigate(1)}
                            className="w-10 h-10 rounded-full border border-[#cbd5e1] bg-[#FFEC8B] flex items-center justify-center text-[#1a202c] hover:bg-[#1a3a52] hover:text-white hover:border-[#1a3a52] transition-colors"
                            aria-label="Nächste Kategorie"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Carousel – py-3 / -my-3: gibt Box-Shadow der Cards genug Luft, damit er nicht geclippt wird */}
                <div className="overflow-hidden py-3 -my-3">
                    <div
                        className="flex items-stretch"
                        style={{
                            width: `${(TOTAL / itemsPerView) * 100}%`,
                            transform: `translateX(${translatePct}%)`,
                            transition: withTransition ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                        }}
                        onTransitionEnd={onTransitionEnd}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        {EXTENDED.map((cat, idx) => (
                            <div
                                key={`${cat.id}-${idx}`}
                                style={{ width: `${100 / TOTAL}%` }}
                                className="px-3"
                            >
                                <div className="h-full bg-white rounded-[8px] border border-[#cbd5e1] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group hover:shadow-md transition-shadow duration-300">

                                    {/* Bild — festes Seitenverhältnis 16:10 */}
                                    <div className="relative w-full shrink-0" style={{ paddingBottom: '62%' }}>
                                        <Image
                                            src={cat.imageUrl}
                                            alt={cat.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
                                            draggable={false}
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                                    </div>

                                    {/* Text + Button */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="font-['Inter'] font-semibold text-[18px] text-[#1a202c] mb-2">
                                            {cat.title}
                                        </h3>
                                        <p className="font-['Inter'] text-[14px] text-[#64748b] leading-[22px] flex-1 mb-6">
                                            {cat.description}
                                        </p>
                                        <Link href={`/produkte?kategorie=${cat.slug}`} className="block shrink-0">
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

                {/* Dot-Indikatoren */}
                <div className="flex justify-center gap-[6px] mt-8">
                    {CATEGORIES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setWithTransition(true); setCurrentIndex(N + idx); isJumping.current = false; }}
                            aria-label={`Kategorie ${idx + 1}`}
                            className={`rounded-full transition-all duration-300 ${activeDot === idx
                                ? 'w-6 h-2 bg-[#1a3a52]'
                                : 'w-2 h-2 bg-[#cbd5e1] hover:bg-[#94a3b8]'
                                }`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}
