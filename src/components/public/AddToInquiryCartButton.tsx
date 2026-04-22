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
    variant?: "playful" | "classic";
    className?: string;
};

export function AddToInquiryCartButton({
    item,
    iconOnly = false,
    variant = "classic",
    className = "",
}: AddToInquiryCartButtonProps) {
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
        const iconOnlyClassName = variant === "playful"
            ? "inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border-b-4 border-yellow-600 bg-yellow-400 text-red-600 font-bold shadow-[0_4px_0_#ca8a04] hover:-translate-y-1 hover:shadow-[0_6px_0_#ca8a04] hover:bg-yellow-300 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            : "inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] border border-[#cbd5e1] bg-white text-[#1a3a52] transition-all hover:border-[#1a3a52] hover:bg-[#f7f8fa] focus:outline-none focus:ring-2 focus:ring-[#1a3a52] focus:ring-offset-2";
        const iconSize = variant === "playful" ? 24 : 20;
        const iconStrokeClass = variant === "playful" ? "stroke-[3]" : undefined;

        return (
            <button
                type="button"
                onClick={handleClick}
                disabled={isSoldOut}
                aria-label={inCart ? `${item.title} erneut zum Anfragekorb hinzufuegen` : `${item.title} zum Anfragekorb hinzufuegen`}
                className={`${iconOnlyClassName} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            >
                {justAdded
                    ? <Check size={iconSize} className={iconStrokeClass} />
                    : <ShoppingCart size={iconSize} className={iconStrokeClass} />}
            </button>
        );
    }

    const fullButtonClassName = variant === "playful"
        ? "inline-flex h-[54px] shrink-0 items-center justify-center gap-2 rounded-full border-b-4 border-yellow-600 bg-yellow-400 px-6 font-bold text-[18px] text-red-600 shadow-[0_4px_0_#ca8a04] hover:-translate-y-1 hover:shadow-[0_6px_0_#ca8a04] hover:bg-yellow-300 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
        : "inline-flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-[16px] bg-[#3b82f6] px-6 font-['Nunito'] font-medium text-[16px] text-[#1a3a52] shadow-sm transition-all hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2";
    const iconSize = variant === "playful" ? 20 : 18;
    const iconStrokeClass = variant === "playful" ? "stroke-[3]" : undefined;
    const label = variant === "playful"
        ? isSoldOut
            ? "Nicht verfuegbar"
            : justAdded
                ? "Hinzugefuegt!"
                : inCart
                    ? "Nochmals"
                    : "In Anfragekorb"
        : isSoldOut
            ? "Nicht verfuegbar"
            : justAdded
                ? "Hinzugefuegt"
                : inCart
                    ? "Nochmals hinzufuegen"
                    : "In Anfragekorb";

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isSoldOut}
            style={variant === "playful" ? { fontFamily: 'var(--font-fredoka), sans-serif' } : undefined}
            className={`${fullButtonClassName} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {justAdded
                ? <Check size={iconSize} className={iconStrokeClass} />
                : <ShoppingCart size={iconSize} className={iconStrokeClass} />}
            <span>{label}</span>
        </button>
    );
}
