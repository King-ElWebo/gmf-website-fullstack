"use client";

import Link from 'next/link';
import { Button } from './Button';

interface ProductCardProps {
    id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    badge?: string;
    badgeColor?: 'gray' | 'yellow';
}

export function ProductCard({
    id,
    title,
    description,
    price,
    imageUrl,
    badge,
    badgeColor = 'gray'
}: ProductCardProps) {
    const badgeStyles = {
        gray: "bg-[#f7f8fa] text-[#2d3748]",
        yellow: "bg-[#fbbf24] text-[#1a3a52]"
    };

    return (
        <div className="bg-white rounded-[8px] border border-[#cbd5e1] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
            <Link href={`/produkt/${id}`} className="block">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-[200px] object-cover"
                />
            </Link>
            <div className="p-[24px] flex flex-col gap-[12px] flex-1">
                <div className="flex items-center justify-between">
                    <Link href={`/produkt/${id}`}>
                        <h3 className="font-['Inter'] font-medium text-[16px] leading-[24px] text-[#1a202c] hover:text-[#1a3a52]">
                            {title}
                        </h3>
                    </Link>
                    {badge && (
                        <span className={`${badgeStyles[badgeColor]} rounded-[4px] px-[12px] py-[4px] font-['Inter'] font-medium text-[12px] leading-[16px]`}>
                            {badge}
                        </span>
                    )}
                </div>
                <p className="font-['Inter'] text-[14px] leading-[20px] text-[#4a5568] flex-1">
                    {description}
                </p>
                <div className="flex items-center justify-between mt-2">
                    <p className="font-['Inter'] font-semibold text-[16px] leading-[25.6px] text-[#4a5568]">
                        {price}
                    </p>
                    <Link href={`/buchen/${id}`}>
                        <Button variant="primary">Buchen</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
