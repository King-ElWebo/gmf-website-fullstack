"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useInquiryCart } from "@/components/public/InquiryCartProvider";
import type { InquiryCartPriceType } from "@/lib/inquiry-cart/pricing";

type AddToInquiryCartButtonProps = {
    item: {
        id: string;
        slug: string;
        title: string;
        price: string | null;
        priceType: InquiryCartPriceType;
        basePriceCents: number | null;
        priceLabel: string | null;
        trackInventory: boolean;
        totalStock: number;
        imageUrl: string;
        summary?: string | null;
    };
    iconOnly?: boolean;
    className?: string;
};

export function AddToInquiryCartButton({ item, iconOnly = false, className = "" }: AddToInquiryCartButtonProps) {
    const { addItem, isInCart } = useInquiryCart();
    const [justAdded, setJustAdded] = useState(false);

    const inCart = isInCart(item.id);
    const isSoldOut = item.trackInventory && item.totalStock <= 0;

    const handleClick = () => {
        if (isSoldOut) return;

        addItem(item);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1400);
    };

    if (iconOnly) {
        return (
            <button
                type="button"
                onClick={handleClick}
                disabled={isSoldOut}
                aria-label={inCart ? `${item.title} erneut zum Anfragekorb hinzufuegen` : `${item.title} zum Anfragekorb hinzufuegen`}
                className={`inline-flex h-[48px] w-[48px] items-center justify-center rounded-[8px] border border-[#cbd5e1] bg-white text-[#1a3a52] transition-colors hover:border-[#1a3a52] hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            >
                {justAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isSoldOut}
            className={`inline-flex h-[48px] items-center justify-center gap-2 rounded-[8px] bg-[#fbbf24] px-6 font-['Inter'] font-medium text-[16px] text-[#1a3a52] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {justAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
            <span>{isSoldOut ? "Nicht verfuegbar" : justAdded ? "Hinzugefuegt" : inCart ? "Nochmals hinzufuegen" : "In Anfragekorb"}</span>
        </button>
    );
}
