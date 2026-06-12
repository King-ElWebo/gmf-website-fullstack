"use client";

import React from "react";
import { AlertTriangle, Truck, Store } from "lucide-react";
import { Input } from "@/components/public/Input";
import { DeliveryNoticeBox } from "@/components/public/PricingNotice";
import type { SiteSettingsRecord } from "@/lib/repositories/site-settings";

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

interface DeliveryStepProps {
    formState: FormState;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    allowedDeliveryTypes: ("pickup" | "delivery")[];
    showDeliveryDropdown: boolean;
    hasDeliveryOnlyItem: boolean;
    hasPickupOnlyItem: boolean;
    settings?: SiteSettingsRecord;
    handleBillingAddressToggle: (checked: boolean) => void;
}

export function DeliveryStep({
    formState,
    setFormState,
    allowedDeliveryTypes,
    showDeliveryDropdown,
    hasDeliveryOnlyItem,
    hasPickupOnlyItem,
    settings,
    handleBillingAddressToggle,
}: DeliveryStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-['Nunito'] font-semibold text-[22px] text-[#1a202c] mb-1">
                    Lieferung & Adresse
                </h2>
                <p className="font-['Nunito'] text-[14px] text-[#64748b]">
                    Wählen Sie die gewünschte Bereitstellung und geben Sie Ihre Adresse an.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                <div className="space-y-5">
                    {/* Delivery type selection */}
                    <div className="space-y-2">
                        <label className="font-['Nunito'] font-medium text-[14px] leading-[21px] text-[#1a202c]">
                            Bereitstellungsart
                        </label>
                        {showDeliveryDropdown ? (
                            <select
                                value={formState.deliveryType}
                                onChange={(e) => setFormState((current) => ({ ...current, deliveryType: e.target.value as "pickup" | "delivery" }))}
                                className="bg-white h-[50px] w-full rounded-[16px] px-[16px] py-[12px] font-['Nunito'] text-[16px] text-[#2d3748] border border-[#cbd5e1] focus:outline-none focus:border-[#1a3a52] transition-colors"
                            >
                                {allowedDeliveryTypes.includes("pickup") && (
                                    <option value="pickup">Selbstabholung</option>
                                )}
                                {allowedDeliveryTypes.includes("delivery") && (
                                    <option value="delivery">Lieferung</option>
                                )}
                            </select>
                        ) : (
                            <div className="space-y-2">
                                {hasDeliveryOnlyItem && hasPickupOnlyItem ? (
                                    <div className="flex flex-col gap-2 rounded-[16px] border border-[#fef08a] bg-[#fffbf2] p-4 shadow-sm">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ca8a04]/10 text-[#ca8a04] shrink-0">
                                                <AlertTriangle size={18} />
                                            </div>
                                            <div>
                                                 <h4 className="font-['Nunito'] font-semibold text-[15px] text-[#854d0e]">
                                                     Lieferung & Selbstabholung (Mischbestellung)
                                                 </h4>
                                                 <p className="font-['Nunito'] text-[12px] text-[#854d0e]/80">
                                                     Vorgegeben durch Artikelauswahl
                                                 </p>
                                            </div>
                                        </div>
                                        <p className="font-['Nunito'] text-[13px] leading-[20px] text-[#854d0e] mt-1">
                                            Ihr Warenkorb enthält sowohl Produkte zur <em>reinen Selbstabholung</em> als auch Produkte zur <em>reinen Lieferung</em>. Die genaue Logistik wird individuell mit Ihnen im Angebot vereinbart.
                                        </p>
                                    </div>
                                ) : hasDeliveryOnlyItem ? (
                                    <div className="flex flex-col gap-2 rounded-[16px] border border-[#bfdbfe] bg-[#f0f7ff] p-4 shadow-sm">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb] shrink-0">
                                                <Truck size={18} />
                                            </div>
                                            <div>
                                                 <h4 className="font-['Nunito'] font-semibold text-[15px] text-[#1e40af]">
                                                     Nur Lieferung möglich
                                                 </h4>
                                                 <p className="font-['Nunito'] text-[12px] text-[#1e40af]/80">
                                                     Vorgegeben durch Artikelauswahl
                                                 </p>
                                            </div>
                                        </div>
                                        <p className="font-['Nunito'] text-[13px] leading-[20px] text-[#1e40af] mt-1">
                                            Da sich Produkte im Warenkorb befinden, die <em>nur geliefert</em> werden können, ist für diese Anfrage nur Lieferung möglich.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 rounded-[16px] border border-[#bbf7d0] bg-[#f0fdf4] p-4 shadow-sm">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16a34a]/10 text-[#15803d] shrink-0">
                                                <Store size={18} />
                                            </div>
                                            <div>
                                                 <h4 className="font-['Nunito'] font-semibold text-[15px] text-[#15803d]">
                                                     Nur Selbstabholung möglich
                                                 </h4>
                                                 <p className="font-['Nunito'] text-[12px] text-[#15803d]/80">
                                                     Vorgegeben durch Artikelauswahl
                                                 </p>
                                            </div>
                                        </div>
                                        <p className="font-['Nunito'] text-[13px] leading-[20px] text-[#15803d] mt-1">
                                            Da sich Produkte im Warenkorb befinden, die <em>nur selbst abgeholt</em> werden können, ist für diese Anfrage nur Selbstabholung möglich.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Address Fields */}
                    <div className="space-y-4 rounded-[24px] border border-blue-50 bg-[#f8fafc] p-5 shadow-sm">
                        <div>
                            <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c]">
                                {formState.deliveryType === "delivery" ? "Veranstaltungs- / Lieferadresse" : "Kundenadresse"}
                            </h3>
                            <p className="mt-1 font-['Nunito'] text-[13px] leading-[20px] text-[#64748b]">
                                {formState.deliveryType === "delivery" 
                                    ? "Diese Adresse verwenden wir standardmäßig auch als Rechnungsadresse."
                                    : "Geben Sie Ihre Postanschrift für das Angebot an."}
                            </p>
                        </div>

                        <Input
                            label="Strasse und Hausnummer"
                            value={formState.addressLine1}
                            onChange={(e) => setFormState((current) => ({ ...current, addressLine1: e.target.value }))}
                            required={formState.deliveryType === "delivery"}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="PLZ"
                                value={formState.zip}
                                onChange={(e) => setFormState((current) => ({ ...current, zip: e.target.value.replace(/\D/g, "") }))}
                                required={formState.deliveryType === "delivery"}
                            />
                            <Input
                                label="Ort"
                                value={formState.city}
                                onChange={(e) => setFormState((current) => ({ ...current, city: e.target.value }))}
                                required={formState.deliveryType === "delivery"}
                            />
                        </div>

                        {/* Billing Address Toggle */}
                        <div className="pt-2">
                            <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#cbd5e1] bg-white px-4 py-3 select-none">
                                <input
                                    type="checkbox"
                                    checked={formState.billingAddressDiffers}
                                    onChange={(e) => handleBillingAddressToggle(e.target.checked)}
                                    className="mt-0.5 h-5 w-5 rounded border-[#94a3b8] text-[#066bb7] focus:ring-[#066bb7]"
                                />
                                <span className="font-['Nunito'] text-[14px] leading-[21px] text-[#1a202c]">
                                    Rechnungsadresse weicht ab
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Billing Address Fields */}
                    {formState.billingAddressDiffers && (
                        <div className="space-y-4 rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
                            <div>
                                <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c]">
                                    Rechnungsadresse
                                </h3>
                                <p className="mt-1 font-['Nunito'] text-[13px] leading-[20px] text-[#64748b]">
                                    Geben Sie die abweichende Adresse für die Rechnungslegung an.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pb-2">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={formState.billingCustomerType === "private"}
                                        onChange={() => setFormState(s => ({ ...s, billingCustomerType: "private" }))}
                                        className="h-4 w-4 border-[#94a3b8] text-[#066bb7] focus:ring-[#066bb7]"
                                    />
                                    <span className="font-['Nunito'] text-[14px] text-[#1a202c]">Privatperson</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={formState.billingCustomerType === "business"}
                                        onChange={() => setFormState(s => ({ ...s, billingCustomerType: "business" }))}
                                        className="h-4 w-4 border-[#94a3b8] text-[#066bb7] focus:ring-[#066bb7]"
                                    />
                                    <span className="font-['Nunito'] text-[14px] text-[#1a202c]">Geschäftskunde</span>
                                </label>
                            </div>

                            {formState.billingCustomerType === "private" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Vorname"
                                        value={formState.billingFirstName}
                                        onChange={(e) => setFormState((current) => ({ ...current, billingFirstName: e.target.value }))}
                                        required
                                    />
                                    <Input
                                        label="Nachname"
                                        value={formState.billingLastName}
                                        onChange={(e) => setFormState((current) => ({ ...current, billingLastName: e.target.value }))}
                                        required
                                    />
                                </div>
                            ) : (
                                <Input
                                    label="Firmenname"
                                    value={formState.billingCompanyName}
                                    onChange={(e) => setFormState((current) => ({ ...current, billingCompanyName: e.target.value }))}
                                    required
                                />
                            )}

                            <Input
                                label="Strasse und Hausnummer"
                                value={formState.billingAddressLine1}
                                onChange={(e) => setFormState((current) => ({ ...current, billingAddressLine1: e.target.value }))}
                                required
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="PLZ"
                                    value={formState.billingZip}
                                    onChange={(e) => setFormState((current) => ({ ...current, billingZip: e.target.value.replace(/\D/g, "") }))}
                                    required
                                />
                                <Input
                                    label="Ort"
                                    value={formState.billingCity}
                                    onChange={(e) => setFormState((current) => ({ ...current, billingCity: e.target.value }))}
                                    required
                                />
                            </div>

                            <Input
                                label="Land (optional)"
                                value={formState.billingCountry}
                                onChange={(e) => setFormState((current) => ({ ...current, billingCountry: e.target.value }))}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <DeliveryNoticeBox deliveryTerms={settings?.deliveryTerms} />
                </div>
            </div>
        </div>
    );
}
