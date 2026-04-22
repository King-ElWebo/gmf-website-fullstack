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
                className={`inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border-b-4 border-yellow-600 bg-yellow-400 text-red-600 font-bold shadow-[0_4px_0_#ca8a04] hover:-translate-y-1 hover:shadow-[0_6px_0_#ca8a04] hover:bg-yellow-300 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            >
                {justAdded ? <Check size={24} className="stroke-[3]" /> : <ShoppingCart size={24} className="stroke-[3]" />}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isSoldOut}
            style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
            className={`inline-flex h-[54px] shrink-0 items-center justify-center gap-2 rounded-full border-b-4 border-yellow-600 bg-yellow-400 px-6 font-bold text-[18px] text-red-600 shadow-[0_4px_0_#ca8a04] hover:-translate-y-1 hover:shadow-[0_6px_0_#ca8a04] hover:bg-yellow-300 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {justAdded ? <Check size={20} className="stroke-[3]" /> : <ShoppingCart size={20} className="stroke-[3]" />}
            <span>{isSoldOut ? "Nicht verfuegbar" : justAdded ? "Hinzugefuegt!" : inCart ? "Nochmals" : "In Anfragekorb"}</span>
        </button>
    );
}
