"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useInquiryCart } from "@/components/public/InquiryCartProvider";

type AddToInquiryCartButtonProps = {
    item: {
        id: string;
        slug: string;
        title: string;
        price: string | null;
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

    const handleClick = () => {
        addItem(item);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1400);
    };

    if (iconOnly) {
        return (
            <button
                type="button"
                onClick={handleClick}
                aria-label={inCart ? `${item.title} erneut zum Anfragekorb hinzufügen` : `${item.title} zum Anfragekorb hinzufügen`}
                className={`inline-flex h-[48px] w-[48px] items-center justify-center rounded-[8px] border border-[#cbd5e1] bg-white text-[#1a3a52] transition-colors hover:border-[#1a3a52] hover:bg-[#f7f8fa] ${className}`}
            >
                {justAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`inline-flex h-[48px] items-center justify-center gap-2 rounded-[8px] bg-[#fbbf24] px-6 font-['Inter'] font-medium text-[16px] text-[#1a3a52] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 ${className}`}
        >
            {justAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
            <span>{justAdded ? "Hinzugefügt" : inCart ? "Nochmals hinzufügen" : "In Anfragekorb"}</span>
        </button>
    );
}
