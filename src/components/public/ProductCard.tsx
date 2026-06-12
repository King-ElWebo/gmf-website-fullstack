"use client";

import Link from 'next/link';
import Image from 'next/image';
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
    deliveryAvailable?: boolean;
    pickupAvailable?: boolean;
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
    deliveryAvailable = true,
    pickupAvailable = true,
}: ProductCardProps) {
    const playfulBadgeStyles = {
        gray: "bg-green-500 text-white shadow-md shadow-green-500/30",
        yellow: "bg-red-500 text-white shadow-md shadow-red-500/30"
    };
    const classicBadgeStyles = {
        gray: "bg-[#f7f8fa] text-[#2d3748]",
        yellow: "bg-[#3b82f6] text-white"
    };

    if (variant === 'classic') {
        return (
            <div className="group bg-white rounded-[16px] border border-[#cbd5e1] shadow-sm hover:shadow-xl hover:border-[#94a3b8] transition-[transform,box-shadow,border-color] duration-200 ease-out-strong hover:-translate-y-1 overflow-hidden flex flex-col">
                <Link href={`/produkt/${slug}`} className="block">
                    {imageUrl ? (
                        <div className="relative overflow-hidden w-full h-[220px]">
                            <Image
                                src={imageUrl}
                                alt={title}
                                fill
                                className="object-cover transition-transform duration-300 ease-out-strong group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
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
                                deliveryAvailable,
                                pickupAvailable,
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group bg-white rounded-[28px] border border-orange-100/60 shadow-lg shadow-orange-500/5 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col">
            <Link href={`/produkt/${slug}`} className="block">
                {imageUrl ? (
                    <div className="relative overflow-hidden w-full h-[190px] sm:h-[220px]">
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-300 ease-out-strong group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                    </div>
                ) : (
                    <div className="w-full h-[190px] sm:h-[220px] bg-[linear-gradient(135deg,#dbe7f1,#f7f8fa)] flex items-center justify-center text-[#64748b] text-sm">
                        Kein Bild verfügbar
                    </div>
                )}
            </Link>
            <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <Link href={`/produkt/${slug}`}>
                        <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[19px] sm:text-[21px] leading-[1.2] text-[#1a3a52] group-hover:text-[#f13c20] transition-colors">
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
                <div className="flex items-center justify-between mt-2 pt-4 border-t-2 border-dashed border-orange-200">
                    <PriceDisplay
                        price={price}
                        priceType={priceType}
                        priceClassName="text-[18px] sm:text-[20px] text-[#f13c20]"
                        noteClassName="font-['Nunito'] text-[12px] leading-[18px] text-[#64748b]"
                    />
                </div>
                <div className="mt-2 flex items-center gap-3">
                    <Link href={`/produkt/${slug}`} className="flex-1">
                        <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="flex items-center justify-center w-full h-[50px] bg-gradient-to-r from-[#066bb7] to-[#1a3a52] text-white shadow-md shadow-blue-500/20 rounded-full text-base sm:text-lg transition-all duration-200 active:scale-[0.97] transform-gpu hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">
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
                            deliveryAvailable,
                            pickupAvailable,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
