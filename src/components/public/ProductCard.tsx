"use client";

import Link from 'next/link';
import { Button } from './Button';
import { AddToInquiryCartButton } from './AddToInquiryCartButton';
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
    badgeColor = 'gray'
}: ProductCardProps) {
    const badgeStyles = {
        gray: "bg-[#f7f8fa] text-[#2d3748]",
        yellow: "bg-[#3b82f6] text-white"
    };

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
                        <span className={`${badgeStyles[badgeColor]} rounded-[4px] px-[12px] py-[4px] font-['Nunito'] font-medium text-[12px] leading-[16px]`}>
                            {badge}
                        </span>
                    )}
                </div>
                <p className="font-['Nunito'] text-[14px] leading-[20px] text-[#4a5568] flex-1">
                    {description}
                </p>
                <div className="flex items-center justify-between mt-2">
                    <p className="font-['Nunito'] font-semibold text-[16px] leading-[25.6px] text-[#4a5568]">
                        {price}
                    </p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                    <Link href={`/produkt/${slug}`} className="flex-1">
                        <Button variant="secondary" className="w-full">Details</Button>
                    </Link>
                    <AddToInquiryCartButton
                        iconOnly
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
