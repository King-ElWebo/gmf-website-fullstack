"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AddToInquiryCartButton } from '@/components/public/AddToInquiryCartButton';
import { Button } from '@/components/public/Button';
import { DeliveryNoticeBox, PriceDisplay } from '@/components/public/PricingNotice';
import type { InquiryCartPriceType } from '@/lib/inquiry-cart/pricing';

interface ProduktDetailItem {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    description: string | null;
    price: string | null;
    priceType: InquiryCartPriceType;
    basePriceCents: number | null;
    priceLabel: string | null;
    trackInventory: boolean;
    totalStock: number;
    images: string[];
    videoUrl: string | null;
    category: string;
    catalogType: string;
    deliveryInfo: string | null;
    additionalCostsInfo: string | null;
    usageInfo: string | null;
    rentalNotes: string | null;
    setupRequirements: string | null;
    accessRequirements: string | null;
    depositInfo: string | null;
    depositLabel: string | null;
    cleaningFeeInfo: string | null;
    cleaningFeeLabel: string | null;
    dryingFeeInfo: string | null;
    dryingFeeLabel: string | null;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    requiresDeliveryAddress: boolean;
}

function InfoSection({ title, content }: { title: string; content?: string | null }) {
    if (!content?.trim()) return null;

    return (
        <div className="mb-8">
            <h2 className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] mb-3">{title}</h2>
            <p className="font-['Nunito'] text-[16px] text-[#4a5568] leading-[25.6px] whitespace-pre-line">
                {content}
            </p>
        </div>
    );
}

export function ProduktDetailClient({ item }: { item: ProduktDetailItem }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const operationalHighlights = useMemo(() => {
        const entries = [];

        if (item.deliveryAvailable) entries.push('Lieferung möglich');
        if (item.pickupAvailable) entries.push('Selbstabholung möglich');
        if (item.requiresDeliveryAddress) entries.push('Lieferadresse erforderlich');

        return entries;
    }, [item.deliveryAvailable, item.pickupAvailable, item.requiresDeliveryAddress]);

    const feeHighlights = useMemo(() => {
        const entries = [];

        if (item.depositLabel?.trim()) entries.push(item.depositLabel.trim());
        if (item.cleaningFeeLabel?.trim()) entries.push(item.cleaningFeeLabel.trim());
        if (item.dryingFeeLabel?.trim()) entries.push(item.dryingFeeLabel.trim());

        return entries;
    }, [item.cleaningFeeLabel, item.depositLabel, item.dryingFeeLabel]);

    const canRenderVideoPlayer = Boolean(item.videoUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.videoUrl));

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    };

    return (
        <div className="min-h-screen bg-[#fefce8]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-[14px]">
                        <Link href="/" className="font-['Nunito'] text-[#64748b] hover:text-[#1a3a52]">
                            Start
                        </Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <Link href="/produkte" className="font-['Nunito'] text-[#64748b] hover:text-[#1a3a52]">
                            Produkte
                        </Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <span className="font-['Nunito'] text-[#1a202c]">{item.title}</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        {item.images.length > 0 ? (
                            <>
                                <div className="relative bg-[#fef9c3] rounded-[16px] overflow-hidden mb-4 aspect-[4/3]">
                                    <Image
                                        src={item.images[currentImageIndex]}
                                        alt={item.title}
                                        fill
                                        priority={currentImageIndex === 0}
                                        fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover"
                                    />

                                    {item.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-colors hover:bg-white"
                                                aria-label="Vorheriges Produktbild"
                                            >
                                                <ChevronLeft className="text-[#1a3a52]" size={24} />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-colors hover:bg-white"
                                                aria-label="Naechstes Produktbild"
                                            >
                                                <ChevronRight className="text-[#1a3a52]" size={24} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {item.images.length > 1 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {item.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`relative aspect-[4/3] min-h-12 rounded-[16px] overflow-hidden border-2 transition-colors ${currentImageIndex === index ? 'border-[#1a3a52]' : 'border-[#cbd5e1]'}`}
                                                aria-label={`Produktbild ${index + 1} anzeigen`}
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`${item.title} ${index + 1}`}
                                                    fill
                                                    sizes="(max-width: 1024px) 33vw, 16vw"
                                                    className="object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-[#fef9c3] rounded-[16px] aspect-[4/3] flex items-center justify-center">
                                <p className="font-['Nunito'] text-[14px] text-[#64748b]">Kein Bild vorhanden</p>
                            </div>
                        )}

                        {item.videoUrl && (
                            <div className="mt-6 rounded-[16px] border border-[#cbd5e1] bg-white p-4">
                                <h2 className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] mb-3">Video</h2>
                                {canRenderVideoPlayer ? (
                                    <video src={item.videoUrl} controls className="w-full rounded-[16px]" />
                                ) : (
                                    <a
                                        href={item.videoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-['Nunito'] text-[16px] text-[#1a3a52] hover:underline"
                                    >
                                        Video ansehen
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#f7f8fa] px-3 py-1 text-[12px] font-medium text-[#1a3a52]">
                                {item.catalogType}
                            </span>
                            <span className="rounded-full bg-[#fff4c5] px-3 py-1 text-[12px] font-medium text-[#7c5a00]">
                                {item.category}
                            </span>
                        </div>

                        <h1 className="font-['Nunito'] font-semibold text-[32px] text-[#1a202c] mb-4">
                            {item.title}
                        </h1>

                        {item.summary && (
                            <p className="font-['Nunito'] text-[16px] text-[#4a5568] leading-[25.6px] mb-6">
                                {item.summary}
                            </p>
                        )}

                        <div className="mb-6">
                            <PriceDisplay
                                price={item.price}
                                priceType={item.priceType}
                                priceClassName="font-['Nunito'] font-semibold text-[24px] text-[#4a5568]"
                                noteClassName="font-['Nunito'] text-[13px] text-[#64748b]"
                            />
                        </div>

                        <DeliveryNoticeBox className="mb-6" />

                        {operationalHighlights.length > 0 && (
                            <div className="mb-6 flex flex-wrap gap-2">
                                {operationalHighlights.map((entry) => (
                                    <span key={entry} className="rounded-full bg-[#fef9c3] px-3 py-1 text-[13px] text-[#1a3a52]">
                                        {entry}
                                    </span>
                                ))}
                            </div>
                        )}

                        {feeHighlights.length > 0 && (
                            <div className="mb-8 flex flex-wrap gap-2">
                                {feeHighlights.map((entry) => (
                                    <span key={entry} className="rounded-full border border-[#cbd5e1] bg-white px-3 py-1 text-[13px] text-[#4a5568]">
                                        {entry}
                                    </span>
                                ))}
                            </div>
                        )}

                        <InfoSection title="Beschreibung" content={item.description} />
                        <InfoSection title="Lieferung & Abholung" content={item.deliveryInfo} />
                        <InfoSection title="Zusatzkosten" content={item.additionalCostsInfo} />
                        <InfoSection title="Nutzung" content={item.usageInfo} />
                        <InfoSection title="Hinweise" content={item.rentalNotes} />
                        <InfoSection title="Aufbauanforderungen" content={item.setupRequirements} />
                        <InfoSection title="Zugangsanforderungen" content={item.accessRequirements} />
                        <InfoSection title="Kaution" content={item.depositInfo} />
                        <InfoSection title="Reinigungsgebühr" content={item.cleaningFeeInfo} />
                        <InfoSection title="Trocknungsgebühr" content={item.dryingFeeInfo} />

                        <div className="flex flex-col sm:flex-row gap-4">
                            <AddToInquiryCartButton
                                item={{
                                    id: item.id,
                                    slug: item.slug,
                                    title: item.title,
                                    price: item.price,
                                    priceType: item.priceType,
                                    basePriceCents: item.basePriceCents,
                                    priceLabel: item.priceLabel,
                                    trackInventory: item.trackInventory,
                                    totalStock: item.totalStock,
                                    imageUrl: item.images[0] ?? "",
                                    summary: item.summary,
                                }}
                                className="flex-1"
                            />
                            <Link href="/anfragekorb" className="flex-1">
                                <Button variant="secondary" className="w-full">Zum Anfragekorb</Button>
                            </Link>
                            <Link href="/kontakt" className="flex-1">
                                <Button variant="secondary" className="w-full">Fragen? Kontakt</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
