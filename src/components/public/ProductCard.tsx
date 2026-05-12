"use client";

import Link from 'next/link';
import { Button } from './Button';
import { AddToInquiryCartButton } from './AddToInquiryCartButton';
import { PriceDisplay } from './PricingNotice';
import type { InquiryCartPriceType } from '@/lib/inquiry-cart/pricing';

interface ProductCardProps {
    id: string;
    slug: string;
    title: string;
    description: string;
    price?: string;
    priceType: InquiryCartPriceType;
    basePriceCents: number | null;
    priceLabel: string | null;
    trackInventory: boolean;
    totalStock: number;
    imageUrl: string;
    badge?: string;
    badgeColor?: 'gray' | 'yellow';
    variant?: 'playful' | 'classic';
}

export function ProductCard({
    id,
    slug,
    title,
    description,
    price,
    priceType,
    basePriceCents,
    priceLabel,
    trackInventory,
    totalStock,
    imageUrl,
    badge,
    badgeColor = 'gray',
    variant = 'playful',
}: ProductCardProps) {
    const playfulBadgeStyles = {
        gray: "bg-green-500 text-white border-2 border-green-600 shadow-sm",
        yellow: "bg-red-500 text-yellow-300 border-2 border-yellow-300 shadow-sm"
    };
    const classicBadgeStyles = {
        gray: "bg-[#f7f8fa] text-[#2d3748]",
        yellow: "bg-[#3b82f6] text-white"
    };

    if (variant === 'classic') {
        return (
            <div className="group bg-white rounded-[16px] border border-[#cbd5e1] shadow-sm hover:shadow-xl hover:border-[#94a3b8] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col">
                <Link href={`/produkt/${slug}`} className="block">
                    {imageUrl ? (
                        <div className="overflow-hidden w-full h-[220px]">
                            <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-[220px] bg-[linear-gradient(135deg,#dbe7f1,#f7f8fa)] flex items-center justify-center text-[#64748b] text-sm">
                            Kein Bild verfügbar
                        </div>
                    )}
                </Link>
                <div className="p-[24px] flex flex-col gap-[12px] flex-1">
                    <div className="flex items-center justify-between">
                        <Link href={`/produkt/${slug}`}>
                            <h3 className="font-['Nunito'] font-medium text-[16px] leading-[24px] text-[#1a202c] hover:text-[#1a3a52]">
                                {title}
                            </h3>
                        </Link>
                        {badge && (
                            <span className={`${classicBadgeStyles[badgeColor]} rounded-[4px] px-[12px] py-[4px] font-['Nunito'] font-medium text-[12px] leading-[16px]`}>
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="font-['Nunito'] text-[14px] leading-[20px] text-[#4a5568] flex-1">
                        {description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <PriceDisplay
                            price={price}
                            priceType={priceType}
                            priceClassName="font-['Nunito'] font-semibold text-[16px] leading-[25.6px] text-[#4a5568]"
                        />
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                        <Link href={`/produkt/${slug}`} className="flex-1">
                            <Button variant="secondary" className="w-full">Details</Button>
                        </Link>
                        <AddToInquiryCartButton
                            iconOnly
                            variant="classic"
                            item={{
                                id,
                                slug,
                                title,
                                price: price ?? null,
                                priceType,
                                basePriceCents,
                                priceLabel,
                                trackInventory,
                                totalStock,
                                imageUrl,
                                summary: description,
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group bg-white rounded-[32px] border-4 border-blue-200 shadow-[6px_6px_0_#bfdbfe] hover:shadow-[8px_8px_0_#60a5fa] hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col">
            <Link href={`/produkt/${slug}`} className="block">
                {imageUrl ? (
                    <div className="overflow-hidden w-full h-[190px] sm:h-[220px]">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <div className="w-full h-[190px] sm:h-[220px] bg-[linear-gradient(135deg,#dbe7f1,#f7f8fa)] flex items-center justify-center text-[#64748b] text-sm">
                        Kein Bild verfügbar
                    </div>
                )}
            </Link>
            <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1 bg-[#f8fafc]">
                <div className="flex items-start justify-between gap-2">
                    <Link href={`/produkt/${slug}`}>
                        <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[20px] sm:text-[22px] leading-[1.2] text-blue-700 group-hover:text-red-500 transition-colors">
                            {title}
                        </h3>
                    </Link>
                    {badge && (
                        <span className={`${playfulBadgeStyles[badgeColor]} rounded-full px-3 py-1 font-bold text-[11px] sm:text-[12px] leading-[16px] uppercase tracking-wider shrink-0`}>
                            {badge}
                        </span>
                    )}
                </div>
                <p className="font-['Nunito'] text-[14px] sm:text-[15px] leading-[22px] text-[#64748b] flex-1">
                    {description}
                </p>
                <div className="flex items-center justify-between mt-2 pt-4 border-t-2 border-dashed border-blue-200">
                    <PriceDisplay
                        price={price}
                        priceType={priceType}
                        priceClassName="text-[18px] sm:text-[20px] text-red-600"
                        noteClassName="font-['Nunito'] text-[12px] leading-[18px] text-[#64748b]"
                    />
                </div>
                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Link href={`/produkt/${slug}`} className="flex-1">
                        <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="flex items-center justify-center w-full bg-blue-500 text-white border-b-4 border-blue-700 py-2 rounded-full text-base sm:text-lg hover:bg-blue-400 hover:border-blue-600 transition-colors">
                            🔍 Details
                        </span>
                    </Link>
                    <AddToInquiryCartButton
                        iconOnly
                        variant="playful"
                        item={{
                            id,
                            slug,
                            title,
                            price: price ?? null,
                            priceType,
                            basePriceCents,
                            priceLabel,
                            trackInventory,
                            totalStock,
                            imageUrl,
                            summary: description,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
