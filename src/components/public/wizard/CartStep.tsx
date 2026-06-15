"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, AlertTriangle } from "lucide-react";
import { PriceDisplay, InquiryPricingNotice } from "@/components/public/PricingNotice";
import { formatPriceCents } from "@/lib/items/price";

import type { InquiryCartItem } from "@/components/public/InquiryCartProvider";

interface CartStepProps {
    items: InquiryCartItem[];
    itemCount: number;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, qty: number) => void;
    clearCart: () => void;
    pricingByItemId: Map<string, any>;
    availabilityByItemId: Record<string, any>;
    selectedRangeLabel: string;
    getPricingReasonLabel: (reason: string | null) => string | null;
}

export function CartStep({
    items,
    itemCount,
    removeItem,
    updateQuantity,
    clearCart,
    pricingByItemId,
    availabilityByItemId,
    selectedRangeLabel,
    getPricingReasonLabel,
}: CartStepProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h2 className="font-['Nunito'] font-semibold text-[22px] text-[#1a202c]">
                    Ausgewählte Produkte ({itemCount})
                </h2>
                <button
                    type="button"
                    onClick={clearCart}
                    className="font-['Nunito'] text-[14px] text-[#64748b] hover:text-[#1a3a52] transition-colors"
                >
                    Alles entfernen
                </button>
            </div>

            <div className="space-y-4">
                {items.map((item) => {
                    const pricing = pricingByItemId.get(item.id);
                    const availability = availabilityByItemId[item.id];

                    const periodText = pricing && pricing.bookingDays != null
                        ? `${selectedRangeLabel} (${pricing.bookingDays} Tag${pricing.bookingDays === 1 ? "" : "e"})`
                        : selectedRangeLabel;

                    const stockLabel =
                        availability && availability.resourceLimitReached
                            ? "Für den gewählten Zeitraum ist keine Lieferung/Aufbaukapazität verfügbar."
                            : availability && availability.trackInventory && availability.availableQuantity != null
                                ? availability.isAvailable
                                    ? `Verfügbar im Zeitraum: ${availability.availableQuantity}`
                                    : availability.availableQuantity === 0
                                        ? "Nicht verfügbar im gewählten Zeitraum"
                                        : `Nicht ausreichend verfügbar im Zeitraum (max. ${availability.availableQuantity})`
                                : item.trackInventory
                                    ? `Bestand: ${item.totalStock}`
                                    : null;

                    return (
                        <div
                            key={item.id}
                            className="flex flex-col gap-4 rounded-[24px] border border-blue-50 bg-[#f8fafc] p-4 sm:flex-row hover:shadow-md transition-shadow"
                        >
                            <div className="relative h-[110px] w-full overflow-hidden rounded-[16px] bg-[#fef9c3] sm:w-[160px] shrink-0">
                                {item.imageUrl ? (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, 160px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-[#64748b]">
                                        Kein Bild
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col justify-between gap-3">
                                <div>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <Link
                                                href={`/produkt/${item.slug}`}
                                                className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] hover:text-[#066bb7] transition-colors"
                                            >
                                                {item.title}
                                            </Link>
                                            {item.summary && (
                                                <p className="mt-1 font-['Nunito'] text-[14px] leading-[20px] text-[#64748b]">
                                                    {item.summary}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f8fa] text-[#64748b] transition-colors hover:bg-[#fee2e2] hover:text-[#b91c1c] shrink-0"
                                            aria-label={`${item.title} entfernen`}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3">
                                    <div className="space-y-1 min-w-[200px]">
                                        <PriceDisplay
                                            price={item.price}
                                            priceType={item.priceType}
                                            priceClassName="font-['Nunito'] font-semibold text-[16px] text-[#4a5568]"
                                        />
                                        {pricing && (
                                            <div className="mt-1.5 space-y-1">
                                                {pricing.isAutoCalculated &&
                                                pricing.calculatedUnitPriceCents != null &&
                                                pricing.calculatedTotalPriceCents != null ? (
                                                    <div>
                                                        <p className="font-['Nunito'] text-[12px] text-[#64748b]">
                                                            Zeitraum: {periodText}
                                                        </p>
                                                        <p className="font-['Nunito'] text-[13px] text-[#1a3a52] mt-0.5">
                                                            Berechnet: {formatPriceCents(pricing.calculatedUnitPriceCents)} inkl. MwSt. x {item.quantity} ={" "}
                                                            <span className="font-semibold">{formatPriceCents(pricing.calculatedTotalPriceCents)} inkl. MwSt.</span>
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {pricing.reason && (
                                                            <p className="font-['Nunito'] text-[13px] text-[#64748b]">
                                                                {getPricingReasonLabel(pricing.reason)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {stockLabel && (
                                                    availability && !availability.isAvailable ? (
                                                        <span className="inline-flex items-center gap-1.5 mt-1 rounded-[6px] bg-[#fef2f2] border border-[#fecaca] px-2.5 py-0.5">
                                                            <AlertTriangle size={12} className="text-[#dc2626] shrink-0" />
                                                            <span className="font-['Nunito'] text-[11px] font-medium text-[#991b1b]">
                                                                {stockLabel}
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <p className="font-['Nunito'] text-[12px] text-[#64748b]">
                                                            {stockLabel}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="font-['Nunito'] text-[14px] text-[#64748b]">Menge</span>
                                        <div className="flex items-center rounded-[16px] border border-[#cbd5e1] bg-white">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="h-10 w-10 text-[#1a3a52] font-semibold hover:bg-slate-50 rounded-l-[16px] transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="min-w-[40px] text-center font-['Nunito'] text-[14px] text-[#1a202c] font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const stockMaxFromAvailability =
                                                        availability && availability.trackInventory && availability.availableQuantity != null
                                                            ? Math.max(0, availability.availableQuantity)
                                                            : null;
                                                    const stockMax =
                                                        stockMaxFromAvailability ??
                                                        (item.trackInventory ? Math.max(0, item.totalStock) : null);

                                                    if (stockMax == null) {
                                                        updateQuantity(item.id, item.quantity + 1);
                                                        return;
                                                    }

                                                    if (stockMax === 0) return;
                                                    updateQuantity(item.id, Math.min(stockMax, item.quantity + 1));
                                                }}
                                                className="h-10 w-10 text-[#1a3a52] font-semibold hover:bg-slate-50 rounded-r-[16px] transition-colors"
                                                disabled={(() => {
                                                    const stockMaxFromAvailability =
                                                        availability && availability.trackInventory && availability.availableQuantity != null
                                                            ? Math.max(0, availability.availableQuantity)
                                                            : null;
                                                    const stockMax =
                                                        stockMaxFromAvailability ??
                                                        (item.trackInventory ? Math.max(0, item.totalStock) : null);
                                                    return stockMax != null && item.quantity >= stockMax;
                                                })()}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-2 border-t border-slate-100">
                <InquiryPricingNotice />
            </div>
        </div>
    );
}
