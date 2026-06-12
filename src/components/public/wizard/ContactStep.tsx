"use client";

import React from "react";
import { Input } from "@/components/public/Input";
import { Textarea } from "@/components/public/Textarea";

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

interface ContactStepProps {
    formState: FormState;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

export function ContactStep({
    formState,
    setFormState,
}: ContactStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-['Nunito'] font-semibold text-[22px] text-[#1a202c] mb-1">
                    Kontaktdaten
                </h2>
                <p className="font-['Nunito'] text-[14px] text-[#64748b]">
                    Bitte geben Sie Ihre Kontaktdaten an, damit wir Sie für das Angebot erreichen können.
                </p>
            </div>

            <div className="max-w-[700px] space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Vorname"
                        value={formState.firstName}
                        onChange={(e) => setFormState((current) => ({ ...current, firstName: e.target.value }))}
                        required
                    />
                    <Input
                        label="Nachname"
                        value={formState.lastName}
                        onChange={(e) => setFormState((current) => ({ ...current, lastName: e.target.value }))}
                        required
                    />
                </div>

                <Input
                    label="E-Mail"
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState((current) => ({ ...current, email: e.target.value }))}
                    required
                />

                <Input
                    label="Telefon"
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState((current) => ({ ...current, phone: e.target.value.replace(/[^0-9+\s\-()/]/g, "") }))}
                    required
                />

                <Textarea
                    label="Zusätzliche Nachricht (optional)"
                    placeholder="Weitere Infos zu Ihrer Anfrage, Ablaufzeiten oder besondere Wünsche..."
                    value={formState.message}
                    onChange={(e) => setFormState((current) => ({ ...current, message: e.target.value }))}
                    rows={5}
                />
            </div>
        </div>
    );
}
