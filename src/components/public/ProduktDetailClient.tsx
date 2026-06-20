"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddToInquiryCartButton } from '@/components/public/AddToInquiryCartButton';
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
    infoTemplate: {
        title: string;
        blocks: {
            highlightLabel: string;
            heading: string;
            body: string;
        }[];
    } | null;
}

type DetailGroup = {
    title: string;
    sections: { label?: string; content?: string | null }[];
};

type DetailVariant = 'playful' | 'tech';

function normalizeForVariant(value: string | null | undefined) {
    return (value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isTechProduct(item: ProduktDetailItem) {
    const haystack = [
        item.catalogType,
        item.category,
        item.slug,
        item.title,
    ].map(normalizeForVariant).join(' ');

    const techTerms = [
        'licht',
        'ton',
        'audio',
        'technik',
        'ambient',
        'beleuchtung',
        'spezialbeleuchtung',
        'komplettset',
        'lautsprecher',
        'sound',
        'partybeleuchtung',
        'dj',
    ];

    return techTerms.some((term) => haystack.includes(term));
}

function DetailAccordion({ groups, variant }: { groups: DetailGroup[]; variant: DetailVariant }) {
    const renderableGroups = groups
        .map((group) => ({
            ...group,
            sections: group.sections.filter((section) => section.content?.trim()),
        }))
        .filter((group) => group.sections.length > 0);

    if (renderableGroups.length === 0) return null;

    const isTech = variant === 'tech';

    return (
        <section className="mt-8 lg:mt-10" aria-labelledby="produktdetails-heading">
            <div className="mb-5">
                <p className={`font-['Nunito'] text-[13px] font-semibold uppercase tracking-[0.14em] ${isTech ? 'text-[#1a3a52]' : 'text-[#f13c20]'}`}>
                    Produktdetails
                </p>
                <h2 id="produktdetails-heading" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="mt-1 text-[24px] text-[#1a3a52]">
                    Alles Wichtige kompakt geordnet
                </h2>
            </div>

            <Accordion.Root type="multiple" defaultValue={[renderableGroups[0].title]} className="space-y-4">
                {renderableGroups.map((group) => (
                    <Accordion.Item key={group.title} value={group.title} className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white shadow-sm">
                        <Accordion.Header>
                            <Accordion.Trigger className={`group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors sm:px-6 ${isTech ? 'hover:bg-[#f8fafc]' : 'hover:bg-[#fff8df]'}`}>
                                <span className="font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">{group.title}</span>
                                <ChevronDown size={20} className="shrink-0 text-[#1a3a52] transition-transform group-data-[state=open]:rotate-180" />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                            <div className="space-y-5 border-t border-[#edf2f7] px-5 py-5 sm:px-6">
                                {group.sections.map((section, index) => (
                                    <div key={`${group.title}-${section.label ?? index}`}>
                                        {section.label && (
                                            <h3 className="mb-2 font-['Nunito'] text-[14px] font-bold uppercase tracking-[0.08em] text-[#1a3a52]">
                                                {section.label}
                                            </h3>
                                        )}
                                        <p className="whitespace-pre-line font-['Nunito'] text-[16px] leading-[25.6px] text-[#4a5568]">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </section>
    );
}

function HighlightChips({ entries, variant }: { entries: string[]; variant: DetailVariant }) {
    if (entries.length === 0) return null;

    const chipClassName = variant === 'tech'
        ? "rounded-full border border-[#dbe4ef] bg-[#f8fafc] px-3 py-1 text-[13px] font-medium text-[#1a3a52]"
        : "rounded-full bg-[#fef9c3] px-3 py-1 text-[13px] font-medium text-[#1a3a52]";

    return (
        <div className="flex flex-wrap gap-2">
            {entries.map((entry) => (
                <span key={entry} className={chipClassName}>
                    {entry}
                </span>
            ))}
        </div>
    );
}

function FeeChips({ entries, variant }: { entries: string[]; variant: DetailVariant }) {
    if (entries.length === 0) return null;

    const chipClassName = variant === 'tech'
        ? "rounded-full border border-[#dbe4ef] bg-white px-3 py-1 text-[13px] text-[#475569]"
        : "rounded-full border border-[#cbd5e1] bg-white px-3 py-1 text-[13px] text-[#4a5568]";

    return (
        <div className="flex flex-wrap gap-2">
            {entries.map((entry) => (
                <span key={entry} className={chipClassName}>
                    {entry}
                </span>
            ))}
        </div>
    );
}

export function ProduktDetailClient({ item, deliveryTerms }: { item: ProduktDetailItem; deliveryTerms?: string | null }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const detailVariant: DetailVariant = isTechProduct(item) ? 'tech' : 'playful';
    const isTech = detailVariant === 'tech';

    const styles = {
        page: isTech ? 'bg-white' : 'bg-[#fffdf8]',
        galleryFrame: isTech
            ? 'border border-[#e2e8f0] bg-[#f8fafc]'
            : 'bg-gradient-to-br from-[#fef9e7] to-[#fdf2d1]',
        thumbnailActive: isTech
            ? 'border-[#1a3a52] shadow-md shadow-slate-900/10'
            : 'border-[#f13c20] shadow-md shadow-red-500/20',
        thumbnailIdle: isTech
            ? 'border-[#e2e8f0] hover:border-[#1a3a52]'
            : 'border-[#e2e8f0] hover:border-[#fcd01b]',
        categoryBadge: isTech
            ? 'rounded-full border border-[#dbe4ef] bg-white px-3 py-1 text-[12px] font-medium text-[#1a3a52]'
            : 'rounded-full bg-[#fff4c5] px-3 py-1 text-[12px] font-medium text-[#7c5a00]',
        actionBox: isTech
            ? 'rounded-[20px] border border-[#dbe4ef] bg-white p-5 shadow-md shadow-slate-900/5 sm:p-6'
            : 'rounded-[24px] border border-[#f8d7ce] bg-white p-5 shadow-lg shadow-orange-500/10 sm:p-6',
        priceBox: isTech
            ? 'mb-4 rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-4'
            : 'mb-4 rounded-[18px] bg-[#fff8df] p-4',
        priceEyebrow: isTech
            ? "mb-1 font-['Nunito'] text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1a3a52]"
            : "mb-1 font-['Nunito'] text-[13px] font-semibold uppercase tracking-[0.12em] text-[#7c5a00]",
        priceText: isTech
            ? "font-['Nunito'] text-[28px] font-bold text-[#1a3a52]"
            : "font-['Nunito'] text-[28px] font-bold text-[#f13c20]",
        deliveryNotice: isTech
            ? 'mb-5 border-[#dbe4ef] bg-[#f8fafc]'
            : 'mb-5',
        primaryButton: isTech
            ? 'mb-3 w-full !bg-[#1a3a52] !text-white hover:!bg-[#0f2434] focus:!ring-[#1a3a52]'
            : 'mb-3 w-full !bg-[#f13c20] !text-white hover:!bg-[#d92f16] focus:!ring-[#f13c20]',
        secondaryLink: isTech
            ? "inline-flex h-[50px] w-full items-center justify-center rounded-[16px] border border-[#1a3a52] bg-white px-5 font-['Nunito'] text-[16px] font-medium text-[#1a3a52] transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out-strong hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#1a3a52] focus:ring-offset-2 active:scale-[0.97]"
            : "inline-flex h-[50px] w-full items-center justify-center rounded-[16px] border border-[#1a3a52] bg-[#1a3a52] px-5 font-['Nunito'] text-[16px] font-medium text-white transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out-strong hover:bg-[#0f2434] focus:outline-none focus:ring-2 focus:ring-[#1a3a52] focus:ring-offset-2 active:scale-[0.97]",
        mobileBar: isTech
            ? 'fixed inset-x-0 bottom-0 z-40 border-t border-[#dbe4ef] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden'
            : 'fixed inset-x-0 bottom-0 z-40 border-t border-[#f8d7ce] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(26,58,82,0.14)] backdrop-blur lg:hidden',
        mobilePrice: isTech
            ? "truncate font-['Nunito'] text-[17px] font-bold text-[#1a3a52]"
            : "truncate font-['Nunito'] text-[17px] font-bold text-[#f13c20]",
        mobileButton: isTech
            ? 'h-[48px] max-w-[52vw] shrink-0 px-4 text-[14px] !bg-[#1a3a52] !text-white hover:!bg-[#0f2434] focus:!ring-[#1a3a52] [&_span]:truncate'
            : 'h-[48px] max-w-[52vw] shrink-0 px-4 text-[14px] !bg-[#f13c20] !text-white hover:!bg-[#d92f16] focus:!ring-[#f13c20] [&_span]:truncate',
        quickInfo: isTech
            ? 'mt-5 rounded-[20px] border border-[#dbe4ef] bg-[#f8fafc] p-4'
            : 'mt-5 rounded-[20px] border border-[#e2e8f0] bg-[#f8fafc] p-4',
    };

    const inquiryCartItem = useMemo(() => ({
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
        deliveryAvailable: item.deliveryAvailable,
        pickupAvailable: item.pickupAvailable,
    }), [item]);

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

    const quickHighlights = useMemo(() => {
        if (isTech) {
            const entries = ['Technische Ausstattung', 'Individuelle Abstimmung'];

            if (item.deliveryAvailable) entries.push('Lieferung möglich');
            if (item.pickupAvailable) entries.push('Selbstabholung möglich');

            return entries;
        }

        const entries = ['Zubehör inklusive', 'Strombedarf 230V', 'Aufbau-Hilfe', 'Sicherheit'];

        if (item.deliveryAvailable) entries.push('Lieferung möglich');

        return entries;
    }, [isTech, item.deliveryAvailable, item.pickupAvailable]);

    const detailGroups = useMemo<DetailGroup[]>(() => ([
        {
            title: 'Beschreibung',
            sections: [
                { content: item.description },
                { label: 'Nutzung', content: item.usageInfo },
            ],
        },
        {
            title: 'Lieferung & Aufbau',
            sections: [
                { label: 'Lieferung & Abholung', content: item.deliveryInfo },
                { label: 'Aufbauanforderungen', content: item.setupRequirements },
                { label: 'Zugangsanforderungen', content: item.accessRequirements },
            ],
        },
        {
            title: 'Kosten & Kaution',
            sections: [
                { label: 'Zusatzkosten', content: item.additionalCostsInfo },
                { label: 'Kaution', content: item.depositInfo },
                { label: 'Reinigungsgebühr', content: item.cleaningFeeInfo },
                { label: 'Trocknungsgebühr', content: item.dryingFeeInfo },
            ],
        },
        {
            title: 'Sicherheit & Hinweise',
            sections: [
                { label: 'Hinweise', content: item.rentalNotes },
            ],
        },
    ]), [
        item.accessRequirements,
        item.additionalCostsInfo,
        item.cleaningFeeInfo,
        item.deliveryInfo,
        item.depositInfo,
        item.description,
        item.dryingFeeInfo,
        item.rentalNotes,
        item.setupRequirements,
        item.usageInfo,
    ]);

    const canRenderVideoPlayer = Boolean(item.videoUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.videoUrl));

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    };

    return (
        <div className={`min-h-screen pb-24 lg:pb-0 ${styles.page}`}>
            <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <nav className="flex flex-wrap items-center gap-2 text-[14px]">
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

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.95fr)] lg:items-start lg:gap-12">
                    <div className="min-w-0">
                        {item.images.length > 0 ? (
                            <>
                                <div className={`relative mb-4 aspect-[4/3] overflow-hidden rounded-[20px] ${styles.galleryFrame}`}>
                                    <Image
                                        src={item.images[currentImageIndex]}
                                        alt={item.title}
                                        fill
                                        priority={currentImageIndex === 0}
                                        fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
                                        sizes="(max-width: 1024px) 100vw, 60vw"
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
                                                key={`${image}-${index}`}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`relative aspect-[4/3] min-h-12 overflow-hidden rounded-[12px] border-2 transition-all duration-200 ${currentImageIndex === index ? styles.thumbnailActive : styles.thumbnailIdle}`}
                                                aria-label={`Produktbild ${index + 1} anzeigen`}
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`${item.title} ${index + 1}`}
                                                    fill
                                                    sizes="(max-width: 1024px) 33vw, 20vw"
                                                    className="object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={`flex aspect-[4/3] items-center justify-center rounded-[20px] ${styles.galleryFrame}`}>
                                <p className="font-['Nunito'] text-[14px] text-[#64748b]">Kein Bild vorhanden</p>
                            </div>
                        )}

                        {item.videoUrl && (
                            <div className="mt-6 rounded-[16px] border border-[#cbd5e1] bg-white p-4">
                                <h2 className="mb-3 font-['Nunito'] text-[18px] font-medium text-[#1a202c]">Video</h2>
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

                        {item.infoTemplate && item.infoTemplate.blocks.length > 0 && (
                            <div className="mt-8 rounded-[24px] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-500/5 sm:p-6">
                                <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="mb-4 text-[20px] text-[#1a3a52]">
                                    {item.infoTemplate.title}
                                </h3>
                                <div className="grid grid-cols-1 gap-4 text-sm font-['Nunito'] leading-relaxed text-[#4a5568] sm:grid-cols-2 sm:gap-5">
                                    {item.infoTemplate.blocks.map((block, i) => (
                                        <div key={i} className="flex gap-2.5">
                                            <span className="text-lg font-bold text-[#f13c20]">{block.highlightLabel}</span>
                                            <div>
                                                <strong>{block.heading}:</strong> {block.body}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <DetailAccordion groups={detailGroups} variant={detailVariant} />

                    </div>

                    <aside className="lg:sticky lg:top-28">
                        <div className="mb-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#f7f8fa] px-3 py-1 text-[12px] font-medium text-[#1a3a52]">
                                {item.catalogType}
                            </span>
                            <span className={styles.categoryBadge}>
                                {item.category}
                            </span>
                        </div>

                        <h1 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="mb-4 text-[28px] text-[#1a3a52] sm:text-[34px]">
                            {item.title}
                        </h1>

                        {item.summary && (
                            <p className="mb-5 font-['Nunito'] text-[16px] leading-[25.6px] text-[#4a5568]">
                                {item.summary}
                            </p>
                        )}

                        <div className={styles.actionBox}>
                            <div className={styles.priceBox}>
                                <p className={styles.priceEyebrow}>
                                    Preis & Anfrage
                                </p>
                                <PriceDisplay
                                    price={item.price}
                                    priceType={item.priceType}
                                    priceClassName={styles.priceText}
                                    noteClassName="font-['Nunito'] text-[13px] text-[#64748b]"
                                />
                            </div>

                            <div className="mb-4">
                                <p className="mb-2 font-['Nunito'] text-[13px] font-semibold text-[#1a202c]">Lieferstatus</p>
                                <HighlightChips entries={operationalHighlights} variant={detailVariant} />
                            </div>

                            {feeHighlights.length > 0 && (
                                <div className="mb-4">
                                    <p className="mb-2 font-['Nunito'] text-[13px] font-semibold text-[#1a202c]">Kaution & Gebühren</p>
                                    <FeeChips entries={feeHighlights} variant={detailVariant} />
                                </div>
                            )}

                            <DeliveryNoticeBox className={styles.deliveryNotice} deliveryTerms={deliveryTerms} />

                            <AddToInquiryCartButton
                                item={inquiryCartItem}
                                className={styles.primaryButton}
                            />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Link href="/anfragekorb" className={styles.secondaryLink}>
                                    Zum Anfragekorb
                                </Link>
                                <Link href="/kontakt" className={styles.secondaryLink}>
                                    Fragen? Kontakt
                                </Link>
                            </div>
                        </div>

                        <div className={styles.quickInfo}>
                            <p className="mb-3 font-['Nunito'] text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1a3a52]">
                                Kurz & wichtig
                            </p>
                            <HighlightChips entries={quickHighlights} variant={detailVariant} />
                        </div>
                    </aside>
                </div>
            </div>

            <div className={styles.mobileBar}>
                <div className="mx-auto flex max-w-[1280px] items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <PriceDisplay
                            price={item.price}
                            priceType={item.priceType}
                            priceClassName={styles.mobilePrice}
                            noteClassName="font-['Nunito'] text-[11px] text-[#64748b]"
                        />
                    </div>
                    <AddToInquiryCartButton
                        item={inquiryCartItem}
                        className={styles.mobileButton}
                    />
                </div>
            </div>
        </div>
    );
}
