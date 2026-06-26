"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Clock, AlertTriangle, CloudRain, Info, Check, User, Calendar, MapPin, Mail, Phone, MessageSquare } from "lucide-react";
import { formatPriceCents } from "@/lib/items/price";
import { PriceDisplay } from "@/components/public/PricingNotice";

import type { InquiryCartItem } from "@/components/public/InquiryCartProvider";

type FormState = {
    startDate: string;
    endDate: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    zip: string;
    city: string;
    deliveryType: "pickup" | "delivery";
    billingAddressDiffers: boolean;
    billingCustomerType: "private" | "business";
    billingFirstName: string;
    billingLastName: string;
    billingCompanyName: string;
    billingAddressLine1: string;
    billingZip: string;
    billingCity: string;
    billingCountry: string;
    message: string;
};

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

interface SummaryStepProps {
    items: InquiryCartItem[];
    formState: FormState;
    pricingByItemId: Map<string, any>;
    pricingSummary: PricingSummary;
    selectedRangeLabel: string;
    bookingDuration: BookingDuration;
    submitting: boolean;
    error: string | null;
}

export function SummaryStep({
    items,
    formState,
    pricingByItemId,
    pricingSummary,
    selectedRangeLabel,
    bookingDuration,
    submitting,
    error,
}: SummaryStepProps) {
    const hasBouncyCastle = React.useMemo(() => {
        return items.some(item => 
            item.slug.includes('huepfburg') || 
            item.slug.includes('rutsche') || 
            item.title.toLowerCase().includes('hüpfburg') ||
            item.title.toLowerCase().includes('rutsche')
        );
    }, [items]);

    const [agbAccepted, setAgbAccepted] = React.useState(false);
    const [bouncyCastleAccepted, setBouncyCastleAccepted] = React.useState(false);
    const isFormValid = agbAccepted && (!hasBouncyCastle || bouncyCastleAccepted);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-['Nunito'] font-semibold text-[22px] text-[#1a202c] mb-1">
                    Zusammenfassung Ihrer Anfrage
                </h2>
                <p className="font-['Nunito'] text-[14px] text-[#64748b]">
                    Bitte überprüfen Sie Ihre Angaben ein letztes Mal, bevor Sie die unverbindliche Anfrage absenden.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                <div className="space-y-6">
                    {/* 1. Produkte */}
                    <div className="bg-white border border-blue-100 rounded-[24px] p-5 shadow-sm space-y-4">
                        <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c] border-b border-slate-100 pb-2 flex items-center gap-2">
                            <Check size={18} className="text-[#45b854]" />
                            Ausgewählte Produkte
                        </h3>
                        <div className="divide-y divide-slate-100">
                            {items.map((item) => {
                                const pricing = pricingByItemId.get(item.id);
                                return (
                                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-3 items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 rounded-lg bg-[#fef9c3] overflow-hidden shrink-0 border border-slate-100">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[9px] text-[#64748b]">
                                                        Bild
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-['Nunito'] font-medium text-[15px] text-[#1a202c]">
                                                    {item.title}
                                                </p>
                                                <p className="font-['Nunito'] text-[12px] text-[#64748b]">
                                                    Menge: {item.quantity}x {item.priceLabel ? `| ${item.priceLabel}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {pricing && pricing.isAutoCalculated && pricing.calculatedTotalPriceCents != null ? (
                                                <span className="font-['Nunito'] font-semibold text-[14px] text-[#1a3a52]">
                                                    {formatPriceCents(pricing.calculatedTotalPriceCents)}
                                                </span>
                                            ) : (
                                                <span className="font-['Nunito'] text-[13px] text-[#64748b]">
                                                    Auf Anfrage
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Zeitraum & Bereitstellung */}
                    <div className="bg-white border border-blue-100 rounded-[24px] p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <Calendar size={18} className="text-[#066bb7]" />
                                Zeitraum
                            </h3>
                            <div className="font-['Nunito'] text-[14px] text-[#4a5568] space-y-1">
                                <p><span className="text-[#64748b]">Mietdauer:</span> {selectedRangeLabel}</p>
                                <p>
                                    <span className="text-[#64748b]">Dauer:</span>{" "}
                                    {bookingDuration.days != null ? `${bookingDuration.days} Tag${bookingDuration.days === 1 ? "" : "e"}` : "-"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <MapPin size={18} className="text-[#066bb7]" />
                                Bereitstellung
                            </h3>
                            <div className="font-['Nunito'] text-[14px] text-[#4a5568] space-y-1">
                                <p>
                                    <span className="text-[#64748b]">Art:</span>{" "}
                                    {formState.deliveryType === "delivery" ? "Lieferung durch GMF" : "Selbstabholung"}
                                </p>
                                {Boolean(formState.addressLine1.trim()) && (
                                    <p className="leading-tight mt-1">
                                        <span className="text-[#64748b]">Adresse:</span><br />
                                        {formState.addressLine1}<br />
                                        {formState.zip} {formState.city}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Rechnungsadresse falls abweichend */}
                    {formState.billingAddressDiffers && (
                        <div className="bg-white border border-blue-100 rounded-[24px] p-5 shadow-sm space-y-3">
                            <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <MapPin size={18} className="text-[#066bb7]" />
                                Abweichende Rechnungsadresse
                            </h3>
                            <div className="font-['Nunito'] text-[14px] text-[#4a5568] space-y-1">
                                <p>
                                    <span className="text-[#64748b]">Kunden-Typ:</span>{" "}
                                    {formState.billingCustomerType === "private" ? "Privatperson" : "Geschäftskunde"}
                                </p>
                                <p className="font-medium text-[#1a202c]">
                                    {formState.billingCustomerType === "private"
                                        ? `${formState.billingFirstName} ${formState.billingLastName}`
                                        : formState.billingCompanyName}
                                </p>
                                <p className="leading-tight">
                                    {formState.billingAddressLine1}<br />
                                    {formState.billingZip} {formState.billingCity}
                                    {formState.billingCountry && <><br />{formState.billingCountry}</>}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 4. Kontaktdaten & Nachricht */}
                    <div className="bg-white border border-blue-100 rounded-[24px] p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <User size={18} className="text-[#066bb7]" />
                                Kundendaten
                            </h3>
                            <div className="font-['Nunito'] text-[14px] text-[#4a5568] space-y-1.5">
                                <p className="font-medium text-[#1a202c]">{formState.firstName} {formState.lastName}</p>
                                <p className="flex items-center gap-1.5 text-[13px]">
                                    <Phone size={14} className="text-[#64748b]" />
                                    {formState.phone}
                                </p>
                                <div className="p-3 bg-amber-50 rounded-[14px] border border-amber-200 mt-2">
                                    <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-800">
                                        <Mail size={14} className="text-[#066bb7] shrink-0" />
                                        <span className="break-all">{formState.email}</span>
                                    </p>
                                    <p className="text-[11.5px] text-slate-500 leading-normal mt-1">
                                        Bitte prüfen Sie Ihre E-Mail-Adresse sorgfältig. An diese Adresse senden wir die Eingangsbestätigung und weitere Informationen zu Ihrer Anfrage.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c] border-b border-slate-100 pb-2 flex items-center gap-2">
                                <MessageSquare size={18} className="text-[#066bb7]" />
                                Sonderwünsche / Nachricht
                            </h3>
                            <p className="font-['Nunito'] text-[13.5px] text-[#4a5568] leading-relaxed italic whitespace-pre-line">
                                {formState.message.trim() ? formState.message : "Keine Nachricht hinterlassen."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Preisübersicht summary */}
                    <div className="rounded-[24px] border border-amber-100 bg-[#fffbeb] p-5 shadow-sm space-y-4">
                        <h3 className="font-['Nunito'] font-semibold text-[17px] text-[#1a202c]">
                            Voraussichtlicher Preis
                        </h3>

                        {pricingSummary.autoCalculatedItemCount > 0 ? (
                            <div className="space-y-2">
                                <p className="font-['Nunito'] text-[13px] text-[#64748b]">
                                    Summe automatisch berechenbar:
                                </p>
                                <p className="font-['Fredoka'] font-semibold text-[32px] leading-none text-[#1a3a52]">
                                    {formatPriceCents(pricingSummary.autoCalculatedTotalCents)}
                                </p>
                                <p className="font-['Nunito'] text-[12px] text-[#64748b] leading-normal">
                                    inkl. MwSt.; exklusive Anfahrt- & Lieferkosten.
                                </p>
                                {pricingSummary.hasMixedPricing && (
                                    <div className="rounded-[12px] bg-[#fff9db] border border-[#ffe066] p-2.5 text-[11px] font-['Nunito'] text-[#665200]">
                                        Hinweis: Individuelle Positionen sind in diesem Betrag nicht enthalten.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 bg-white/50 rounded-[16px] border border-[#fde68a] px-3.5 py-3 text-[13px]">
                                <span className="text-[18px] leading-none mt-0.5">💬</span>
                                <div>
                                    <p className="font-['Nunito'] font-semibold text-[#92400e]">
                                        Individuelles Angebot
                                    </p>
                                    <p className="font-['Nunito'] text-[#a16207] leading-relaxed mt-0.5">
                                        Für Ihre Anfrage wird ein individuelles Angebot mit besten Konditionen erstellt.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* STORNO INFO */}
                    <div className="bg-[#fffbeb] border border-amber-100 rounded-[24px] p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#d97706] shrink-0">
                                <ShieldCheck size={15} />
                            </div>
                            <h3 className="font-['Nunito'] font-semibold text-[15px] text-[#1a202c]">Faire Stornobedingungen</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Clock size={15} className="text-[#059669] mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-['Nunito'] text-[12px] font-semibold text-[#1a202c]">Kostenlos</p>
                                    <p className="font-['Nunito'] text-[11.5px] text-[#4a5568]">Bis 2 Tage vor Mietbeginn</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={15} className="text-[#dc2626] mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-['Nunito'] text-[12px] font-semibold text-[#1a202c]">Spätere Stornierung</p>
                                    <p className="font-['Nunito'] text-[11.5px] text-[#4a5568]">Angefallene Kosten bis max. 350 € netto</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <CloudRain size={15} className="text-[#0284c7] mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-['Nunito'] text-[12px] font-semibold text-[#1a202c]">Schlechtwetter-Option</p>
                                    <p className="font-['Nunito'] text-[11.5px] text-[#4a5568]">Kostenlose Stornierung bei Nässe/Sturm nach Absprache</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HAFTUNG INFO */}
                    <div className="bg-[#f0f7ff] border border-blue-100 rounded-[24px] p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#3b82f6] shrink-0">
                                <Info size={15} />
                            </div>
                            <h3 className="font-['Nunito'] font-semibold text-[15px] text-[#1a202c]">Haftung & Versicherung</h3>
                        </div>
                        <ul className="space-y-1.5 text-[12px] font-['Nunito'] text-[#4a5568] leading-relaxed">
                            <li className="flex items-start gap-1.5">
                                <span className="text-[#3b82f6]">•</span>
                                <span>Der Betreiber ist Vermieter. Eine Betreuung/Aufsicht ist nicht inkludiert.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-[#3b82f6]">•</span>
                                <span>Es besteht <strong>keine</strong> Versicherung über den Anbieter. Die Haftung liegt beim Mieter.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-[#3b82f6]">•</span>
                                <span>Detaillierte Haftungsbedingungen erhalten Sie mit dem Angebot.</span>
                            </li>
                        </ul>
                    </div>

                    {error && (
                        <p className="font-['Nunito'] text-[14px] text-[#dc2626] mt-2">
                            {error}
                        </p>
                    )}

                    {hasBouncyCastle && (
                        <div className="bg-[#fffdf8] border border-blue-100 rounded-[16px] p-4 flex items-start gap-3 mt-4">
                            <input 
                                type="checkbox" 
                                id="bouncy-castle-terms" 
                                required 
                                checked={bouncyCastleAccepted}
                                onChange={(e) => setBouncyCastleAccepted(e.target.checked)}
                                className="mt-1 w-4 h-4 text-[#066bb7] rounded border-gray-300 focus:ring-[#066bb7]"
                            />
                            <label htmlFor="bouncy-castle-terms" className="font-['Nunito'] text-[14px] text-[#4a5568] leading-relaxed">
                                Ich habe die <a href="/downloads/verleihbedingungen-huepfburg.pdf" target="_blank" rel="noopener noreferrer" className="text-[#066bb7] hover:underline">Verleihbedingungen für Hüpfburgen</a> sowie die <a href="/downloads/anleitung-huepfburg.pdf" target="_blank" rel="noopener noreferrer" className="text-[#066bb7] hover:underline">Bedienungs- und Sicherheitsanleitung</a> gelesen und zur Kenntnis genommen.
                            </label>
                        </div>
                    )}

                    <div className="bg-[#fffdf8] border border-blue-100 rounded-[16px] p-4 flex items-start gap-3 mt-4">
                        <input 
                            type="checkbox" 
                            id="agb-terms" 
                            required 
                            checked={agbAccepted}
                            onChange={(e) => setAgbAccepted(e.target.checked)}
                            className="mt-1 w-4 h-4 text-[#066bb7] rounded border-gray-300 focus:ring-[#066bb7]"
                        />
                        <label htmlFor="agb-terms" className="font-['Nunito'] text-[14px] text-[#4a5568] leading-relaxed">
                            Ich habe die <Link href="/agb" target="_blank" className="text-[#066bb7] hover:underline">Verleihbedingungen (AGB)</Link> sowie die <Link href="/datenschutz" target="_blank" className="text-[#066bb7] hover:underline">Datenschutzerklärung</Link> gelesen und akzeptiere diese.
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submitting || !isFormValid}
                            className={`w-full h-[54px] rounded-[18px] text-[16px] font-['Fredoka'] font-semibold transition-all duration-200 flex items-center justify-center ${
                                submitting || !isFormValid
                                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                    : "bg-[#066bb7] text-white hover:bg-[#1a3a52] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]"
                            }`}
                        >
                            {submitting ? "Anfrage wird gesendet..." : "Anfrage unverbindlich senden"}
                        </button>
                        <p className="text-center font-['Nunito'] text-[12px] text-[#64748b] mt-3 leading-relaxed">
                            Diese Anfrage ist für Sie vollkommen unverbindlich. Sie erhalten per E-Mail ein fertiges Angebot.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
