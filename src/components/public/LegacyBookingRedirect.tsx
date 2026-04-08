"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInquiryCart } from "@/components/public/InquiryCartProvider";
import type { InquiryCartPriceType } from "@/lib/inquiry-cart/pricing";

type LegacyBookingRedirectProps = {
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
    };
};

export function LegacyBookingRedirect({ item }: LegacyBookingRedirectProps) {
    const router = useRouter();
    const { addItem } = useInquiryCart();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        addItem(item);
        router.replace("/anfragekorb");
    }, [addItem, item, router]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <p className="font-['Inter'] text-[16px] text-[#64748b]">
                    Produkt wird zum Anfragekorb hinzugefügt...
                </p>
            </div>
        </div>
    );
}
