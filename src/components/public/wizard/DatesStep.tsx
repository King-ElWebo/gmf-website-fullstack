"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { DateRangePicker } from "@/components/public/DateRangePicker";
import "@/components/public/DateRangePicker.css";
import { formatPriceCents } from "@/lib/items/price";

interface BookingDuration {
    days: number | null;
    reason: string | null;
}

interface PricingSummary {
    autoCalculatedTotalCents: number;
    autoCalculatedItemCount: number;
    individualItemCount: number;
    hasMixedPricing: boolean;
}

interface DatesStepProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    unavailableDates: Set<string>;
    isLoadingDates: boolean;
    onMonthChange: (year: number, month: number) => void;
    bookingDuration: BookingDuration;
    pricingSummary: PricingSummary;
    availabilityByItemId: Record<string, any>;
    selectedRangeLabel: string;
}

export function DatesStep({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    unavailableDates,
    isLoadingDates,
    onMonthChange,
    bookingDuration,
    pricingSummary,
    availabilityByItemId,
    selectedRangeLabel,
}: DatesStepProps) {
    const hasUnavailableItem = Object.values(availabilityByItemId).some((entry) => !entry.isAvailable);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-['Nunito'] font-semibold text-[22px] text-[#1a202c] mb-1">
                    Mietzeitraum & Verfügbarkeit
                </h2>
                <p className="font-['Nunito'] text-[14px] text-[#64748b]">
                    Wählen Sie den Zeitraum, an dem Sie die Module mieten möchten.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                <div className="space-y-4">
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={onStartDateChange}
                        onEndDateChange={onEndDateChange}
                        unavailableDates={unavailableDates}
                        isLoadingDates={isLoadingDates}
                        onMonthChange={onMonthChange}
                    />

                    {startDate && endDate && bookingDuration.reason === "invalid_date_range" && (
                        <div className="flex items-center gap-2 rounded-[16px] bg-[#fef2f2] border border-[#fecaca] px-4 py-3">
                            <AlertTriangle size={16} className="text-[#dc2626] shrink-0" />
                            <p className="font-['Nunito'] text-[13px] text-[#991b1b]">
                                Das Enddatum darf nicht vor dem Startdatum liegen.
                            </p>
                        </div>
                    )}
                </div>

                <div className="rounded-[24px] border border-amber-100 bg-[#fffbeb] p-5 shadow-sm space-y-4">
                    <h3 className="font-['Nunito'] font-semibold text-[17px] text-[#1a202c]">
                        Preisübersicht
                    </h3>
                    
                    <div className="space-y-2 border-b border-[#fde68a] pb-3 text-[14px] font-['Nunito'] text-[#4a5568]">
                        <p className="flex justify-between">
                            <span>Ausgewählter Zeitraum:</span>
                            <span className="font-medium text-[#1a202c]">{selectedRangeLabel}</span>
                        </p>
                        <p className="flex justify-between">
                            <span>Buchungsdauer:</span>
                            <span className="font-medium text-[#1a202c]">
                                {bookingDuration.days != null ? `${bookingDuration.days} Tag${bookingDuration.days === 1 ? "" : "e"}` : "-"}
                            </span>
                        </p>
                        <p className="flex justify-between">
                            <span>Automatisch berechenbar:</span>
                            <span className="font-medium text-[#1a202c]">
                                {pricingSummary.autoCalculatedItemCount} Produkt
                                {pricingSummary.autoCalculatedItemCount === 1 ? "" : "e"}
                            </span>
                        </p>
                        <p className="flex justify-between">
                            <span>Individuell / auf Anfrage:</span>
                            <span className="font-medium text-[#1a202c]">
                                {pricingSummary.individualItemCount} Produkt
                                {pricingSummary.individualItemCount === 1 ? "" : "e"}
                            </span>
                        </p>
                    </div>

                    <div>
                        {pricingSummary.autoCalculatedItemCount > 0 ? (
                            <div className="space-y-2">
                                <p className="font-['Nunito'] text-[13px] text-[#64748b]">
                                    Voraussichtliche Gesamtsumme (für automatisch berechenbare Produkte):
                                </p>
                                <p className="font-['Fredoka'] font-semibold text-[32px] leading-none text-[#1a3a52]">
                                    {formatPriceCents(pricingSummary.autoCalculatedTotalCents)}
                                </p>
                                <p className="font-['Nunito'] text-[12px] text-[#64748b] leading-relaxed">
                                    inkl. MwSt.; Anfahrt/Lieferung sind nicht enthalten.
                                </p>
                                {pricingSummary.hasMixedPricing && (
                                    <div className="rounded-[12px] bg-[#fff9db] border border-[#ffe066] p-2.5 text-[12px] font-['Nunito'] text-[#665200]">
                                        Hinweis: Die individuellen Positionen werden erst im Angebot berechnet.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 rounded-[16px] bg-[#fffbeb] border border-[#fde68a] px-4 py-3">
                                <span className="text-[20px] leading-none mt-0.5">💬</span>
                                <div>
                                    <p className="font-['Nunito'] font-semibold text-[14px] text-[#92400e] mb-1">
                                        Individuelles Angebot
                                    </p>
                                    <p className="font-['Nunito'] text-[13px] text-[#a16207] leading-[1.4]">
                                        {bookingDuration.days != null && bookingDuration.days > 3
                                            ? `Bei einer Buchungsdauer von ${bookingDuration.days} Tagen erstellen wir Ihnen gerne ein individuelles Angebot.`
                                            : "Für die ausgewählten Produkte wird ein individuelles Angebot erstellt."
                                        }
                                        {" "}Senden Sie Ihre Anfrage ab und wir melden uns zeitnah bei Ihnen.
                                    </p>
                                </div>
                            </div>
                        )}

                        {hasUnavailableItem && (
                            <div className="mt-3 flex items-start gap-2.5 rounded-[16px] bg-[#fef2f2] border border-[#fecaca] px-4 py-3">
                                <AlertTriangle size={16} className="text-[#dc2626] shrink-0 mt-0.5" />
                                <p className="font-['Nunito'] text-[13px] text-[#991b1b] leading-normal">
                                    Mindestens ein Produkt ist im gewählten Zeitraum nicht verfügbar.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
