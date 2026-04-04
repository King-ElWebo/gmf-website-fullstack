"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/public/Button";
import { Input } from "@/components/public/Input";
import { Textarea } from "@/components/public/Textarea";
import { useInquiryCart } from "@/components/public/InquiryCartProvider";

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
    message: string;
};

const initialFormState: FormState = {
    startDate: "",
    endDate: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    zip: "",
    city: "",
    deliveryType: "pickup",
    message: "",
};

export function InquiryCartPageClient() {
    const { items, removeItem, updateQuantity, clearCart, itemCount, hasHydrated } = useInquiryCart();
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ bookingId: string } | null>(null);

    const canSubmit = useMemo(() => {
        return (
            items.length > 0 &&
            formState.startDate &&
            formState.endDate &&
            formState.endDate >= formState.startDate &&
            formState.firstName.trim() &&
            formState.lastName.trim() &&
            formState.email.trim()
        );
    }, [formState, items.length]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);

        const payload = {
            items: items.map((item) => ({
                resourceId: item.id,
                quantity: item.quantity,
            })),
            startDate: formState.startDate,
            endDate: formState.endDate,
            deliveryType: formState.deliveryType,
            customerMessage: formState.message,
            customer: {
                firstName: formState.firstName,
                lastName: formState.lastName,
                email: formState.email,
                phone: formState.phone || undefined,
                addressLine1: formState.addressLine1 || undefined,
                zip: formState.zip || undefined,
                city: formState.city || undefined,
            },
        };

        const response = await fetch("/api/public/bookings/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        setSubmitting(false);

        if (!response.ok) {
            setError(data?.error ?? "Die Anfrage konnte nicht gesendet werden.");
            return;
        }

        clearCart();
        setSuccess({ bookingId: data.bookingId });
        setFormState(initialFormState);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="font-['Inter'] text-[16px] text-[#64748b]">Anfragekorb wird geladen...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fbbf24]">
                            <ShoppingCart className="text-[#1a3a52]" size={30} />
                        </div>
                        <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-4">Anfrage erfolgreich gesendet!</h1>
                        <p className="font-['Inter'] text-[16px] text-[#4a5568] leading-[25.6px] mb-4">
                            Vielen Dank. Ihre Sammelanfrage wurde erfolgreich übermittelt.
                        </p>
                        <p className="font-['Inter'] text-[14px] text-[#64748b] mb-8">
                            Referenz: <strong>{success.bookingId}</strong>
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/produkte"><Button variant="primary">Weitere Produkte ansehen</Button></Link>
                            <Link href="/"><Button variant="secondary">Zur Startseite</Button></Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-[14px]">
                        <Link href="/" className="font-['Inter'] text-[#64748b] hover:text-[#1a3a52]">Start</Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <Link href="/produkte" className="font-['Inter'] text-[#64748b] hover:text-[#1a3a52]">Produkte</Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <span className="font-['Inter'] text-[#1a202c]">Anfragekorb</span>
                    </nav>
                </div>

                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-3">Anfragekorb</h1>
                        <p className="font-['Inter'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[700px]">
                            Sammeln Sie mehrere Produkte und senden Sie anschließend eine gemeinsame Anfrage.
                        </p>
                    </div>
                    <Link href="/produkte">
                        <Button variant="secondary">Weitere Produkte hinzufügen</Button>
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-[8px] border border-[#cbd5e1] bg-[#f7f8fa] p-10 text-center">
                        <p className="font-['Inter'] text-[18px] text-[#1a202c] mb-3">Ihr Anfragekorb ist leer.</p>
                        <p className="font-['Inter'] text-[14px] text-[#64748b] mb-6">
                            Fügen Sie zuerst Produkte hinzu, bevor Sie eine Sammelanfrage absenden.
                        </p>
                        <Link href="/produkte">
                            <Button variant="primary">Zu den Produkten</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
                        <div className="space-y-4">
                            <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-6">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <h2 className="font-['Inter'] font-semibold text-[24px] text-[#1a202c]">
                                        Ausgewählte Produkte ({itemCount})
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={clearCart}
                                        className="font-['Inter'] text-[14px] text-[#64748b] hover:text-[#1a3a52]"
                                    >
                                        Alles entfernen
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex flex-col gap-4 rounded-[8px] border border-[#e2e8f0] p-4 sm:flex-row">
                                            <div className="h-[110px] w-full overflow-hidden rounded-[8px] bg-[#e2e8f0] sm:w-[160px]">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-sm text-[#64748b]">
                                                        Kein Bild
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col gap-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <Link href={`/produkt/${item.slug}`} className="font-['Inter'] font-medium text-[18px] text-[#1a202c] hover:text-[#1a3a52]">
                                                            {item.title}
                                                        </Link>
                                                        {item.summary && (
                                                            <p className="mt-1 font-['Inter'] text-[14px] leading-[20px] text-[#64748b]">
                                                                {item.summary}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f8fa] text-[#64748b] transition-colors hover:bg-[#fee2e2] hover:text-[#b91c1c]"
                                                        aria-label={`${item.title} entfernen`}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <p className="font-['Inter'] font-semibold text-[16px] text-[#4a5568]">
                                                        {item.price || "Preis auf Anfrage"}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-['Inter'] text-[14px] text-[#64748b]">Menge</span>
                                                        <div className="flex items-center rounded-[8px] border border-[#cbd5e1]">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="h-10 w-10 text-[#1a3a52]"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="min-w-[40px] text-center font-['Inter'] text-[14px] text-[#1a202c]">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="h-10 w-10 text-[#1a3a52]"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-6">
                            <h2 className="font-['Inter'] font-semibold text-[24px] text-[#1a202c] mb-6">Sammelanfrage senden</h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Von"
                                        type="date"
                                        value={formState.startDate}
                                        onChange={(e) => setFormState((current) => ({ ...current, startDate: e.target.value }))}
                                        required
                                    />
                                    <Input
                                        label="Bis"
                                        type="date"
                                        value={formState.endDate}
                                        onChange={(e) => setFormState((current) => ({ ...current, endDate: e.target.value }))}
                                        required
                                    />
                                </div>

                                {formState.startDate && formState.endDate && formState.endDate < formState.startDate && (
                                    <p className="font-['Inter'] text-[14px] text-[#dc2626]">
                                        Das Enddatum darf nicht vor dem Startdatum liegen.
                                    </p>
                                )}

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
                                    onChange={(e) => setFormState((current) => ({ ...current, phone: e.target.value }))}
                                />

                                <div className="space-y-2">
                                    <label className="font-['Inter'] font-medium text-[14px] leading-[21px] text-[#1a202c]">
                                        Lieferart
                                    </label>
                                    <select
                                        value={formState.deliveryType}
                                        onChange={(e) => setFormState((current) => ({ ...current, deliveryType: e.target.value as "pickup" | "delivery" }))}
                                        className="bg-white h-[50px] w-full rounded-[8px] px-[16px] py-[12px] font-['Inter'] text-[16px] text-[#2d3748] border border-[#cbd5e1] focus:outline-none focus:border-[#1a3a52]"
                                    >
                                        <option value="pickup">Selbstabholung</option>
                                        <option value="delivery">Lieferung</option>
                                    </select>
                                </div>

                                <Input
                                    label="Adresse"
                                    value={formState.addressLine1}
                                    onChange={(e) => setFormState((current) => ({ ...current, addressLine1: e.target.value }))}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="PLZ"
                                        value={formState.zip}
                                        onChange={(e) => setFormState((current) => ({ ...current, zip: e.target.value }))}
                                    />
                                    <Input
                                        label="Ort"
                                        value={formState.city}
                                        onChange={(e) => setFormState((current) => ({ ...current, city: e.target.value }))}
                                    />
                                </div>

                                <Textarea
                                    label="Nachricht"
                                    placeholder="Zusätzliche Infos zu Ihrer Anfrage..."
                                    value={formState.message}
                                    onChange={(e) => setFormState((current) => ({ ...current, message: e.target.value }))}
                                    rows={6}
                                />

                                {error && (
                                    <p className="font-['Inter'] text-[14px] text-[#dc2626]">
                                        {error}
                                    </p>
                                )}

                                <Button type="submit" variant="primary" disabled={!canSubmit || submitting} className="w-full">
                                    {submitting ? "Anfrage wird gesendet..." : "Gesamtanfrage senden"}
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
