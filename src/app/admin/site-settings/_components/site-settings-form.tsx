"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "../../_components/ui/AdminCard";
import { AdminField, AdminInput, AdminTextarea, AdminCheckbox } from "../../_components/ui/AdminInputs";
import { AdminButton } from "../../_components/ui/AdminButton";

type SocialLinkFormRow = {
    id: string;
    platform: string;
    label: string;
    url: string;
    isActive: boolean;
};

type SiteSettingsFormData = {
    phone: string | null;
    email: string | null;
    address: string | null;
    openingHours: string | null;
    noticeText: string | null;
    heroTitle: string | null;
    heroText: string | null;
    additionalInfo: string | null;
    deliveryTerms: string | null;
    socialLinks: SocialLinkFormRow[];
};

function createEmptySocialLink(): SocialLinkFormRow {
    return {
        id: `local-${Math.random().toString(36).slice(2)}`,
        platform: "",
        label: "",
        url: "",
        isActive: true,
    };
}

export default function SiteSettingsForm({ initial }: { initial: SiteSettingsFormData }) {
    const router = useRouter();
    const [phone, setPhone] = useState(initial.phone ?? "");
    const [email, setEmail] = useState(initial.email ?? "");
    const [address, setAddress] = useState(initial.address ?? "");
    const [openingHours, setOpeningHours] = useState(initial.openingHours ?? "");
    const [noticeText, setNoticeText] = useState(initial.noticeText ?? "");
    const [heroTitle, setHeroTitle] = useState(initial.heroTitle ?? "");
    const [heroText, setHeroText] = useState(initial.heroText ?? "");
    const [additionalInfo, setAdditionalInfo] = useState(initial.additionalInfo ?? "");
    const [deliveryTerms, setDeliveryTerms] = useState(initial.deliveryTerms ?? "");
    const [socialLinks, setSocialLinks] = useState<SocialLinkFormRow[]>(
        initial.socialLinks.length > 0 ? initial.socialLinks : [createEmptySocialLink()]
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function updateSocialLink(id: string, patch: Partial<SocialLinkFormRow>) {
        setSocialLinks((current) => current.map((link) => (link.id === id ? { ...link, ...patch } : link)));
    }

    function addSocialLink() {
        setSocialLinks((current) => [...current, createEmptySocialLink()]);
    }

    function removeSocialLink(id: string) {
        setSocialLinks((current) => {
            const next = current.filter((link) => link.id !== id);
            return next.length > 0 ? next : [createEmptySocialLink()];
        });
    }

    function moveSocialLink(id: string, direction: -1 | 1) {
        setSocialLinks((current) => {
            const index = current.findIndex((link) => link.id === id);
            const targetIndex = index + direction;
            if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current;

            const next = [...current];
            const [item] = next.splice(index, 1);
            next.splice(targetIndex, 0, item);
            return next;
        });
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = {
            phone,
            email,
            address,
            openingHours,
            noticeText,
            heroTitle,
            heroText,
            additionalInfo,
            deliveryTerms,
            socialLinks: socialLinks.map((link) => ({
                platform: link.platform,
                label: link.label,
                url: link.url,
                isActive: link.isActive,
            })),
        };

        const res = await fetch("/api/admin/site-settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setSaving(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data?.error ?? "Save failed");
            return;
        }

        router.refresh();
    }

    return (
        <form onSubmit={onSubmit} className="max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Site Settings</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Zentrale Inhalte für Kontakt, Hero, Footer und allgemeine Infobereiche.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="space-y-6">
                    <AdminCard title="Kontakt" description="Ihre Erreichbarkeit auf der Webseite.">
                        <div className="space-y-5">
                            <AdminField label="Telefonnummer" htmlFor="phone">
                                <AdminInput id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </AdminField>
                            
                            <AdminField label="E-Mail" htmlFor="email">
                                <AdminInput id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </AdminField>
                            
                            <AdminField label="Standort / Adresse" htmlFor="address">
                                <AdminTextarea id="address" rows={4} value={address} onChange={(e) => setAddress(e.target.value)} />
                            </AdminField>
                            
                            <AdminField label="Öffnungszeiten" htmlFor="openingHours">
                                <AdminTextarea id="openingHours" rows={4} value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} />
                            </AdminField>
                        </div>
                    </AdminCard>

                    <AdminCard 
                        title="Social Links" 
                        description="Mehrere Plattformen zentral pflegen." 
                        headerAction={
                            <AdminButton type="button" variant="secondary" onClick={addSocialLink} className="h-8 px-3 text-xs">
                                Link hinzufügen
                            </AdminButton>
                        }
                    >
                        <div className="space-y-4">
                            {socialLinks.map((link, index) => (
                                <div key={link.id} className="relative grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_1fr_2fr_auto]">
                                    <AdminField label="Plattform">
                                        <AdminInput
                                            value={link.platform}
                                            onChange={(e) => updateSocialLink(link.id, { platform: e.target.value })}
                                            placeholder="Instagram"
                                        />
                                    </AdminField>
                                    <AdminField label="Label">
                                        <AdminInput
                                            value={link.label}
                                            onChange={(e) => updateSocialLink(link.id, { label: e.target.value })}
                                            placeholder="Folge uns"
                                        />
                                    </AdminField>
                                    <AdminField label="URL">
                                        <AdminInput
                                            value={link.url}
                                            onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </AdminField>
                                    <div className="flex items-end gap-2 pb-1">
                                        <AdminCheckbox
                                            checked={link.isActive}
                                            onChange={(e) => updateSocialLink(link.id, { isActive: e.target.checked })}
                                            label="Aktiv"
                                        />
                                    </div>
                                    <div className="lg:col-span-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-200 mt-2">
                                        <AdminButton type="button" variant="ghost" onClick={() => moveSocialLink(link.id, -1)} disabled={index === 0} className="h-8 px-3 text-xs">
                                            Hoch
                                        </AdminButton>
                                        <AdminButton type="button" variant="ghost" onClick={() => moveSocialLink(link.id, 1)} disabled={index === socialLinks.length - 1} className="h-8 px-3 text-xs">
                                            Runter
                                        </AdminButton>
                                        <div className="h-4 w-px bg-slate-300 mx-1"></div>
                                        <AdminButton type="button" variant="ghost" onClick={() => removeSocialLink(link.id)} className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                                            Entfernen
                                        </AdminButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminCard>
                </div>

                <div className="h-full space-y-6">
                    <AdminCard title="Inhalte" description="Globale Texte für die gesamte Webseite." className="h-full">
                    <div className="space-y-5">
                        <AdminField label="Hero-Titel" htmlFor="heroTitle">
                            <AdminInput id="heroTitle" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                        </AdminField>
                        
                        <AdminField label="Hero-Text" htmlFor="heroText">
                            <AdminTextarea id="heroText" rows={5} value={heroText} onChange={(e) => setHeroText(e.target.value)} />
                        </AdminField>
                        
                        <AdminField label="Hinweistexte" htmlFor="noticeText">
                            <AdminTextarea id="noticeText" rows={5} value={noticeText} onChange={(e) => setNoticeText(e.target.value)} />
                        </AdminField>
                        
                        <AdminField label="Allgemeine Zusatzinfos" htmlFor="additionalInfo">
                            <AdminTextarea id="additionalInfo" rows={6} value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} />
                        </AdminField>
                        
                        <AdminField 
                            label="Anfahrtsklausel / Lieferbedingungen" 
                            htmlFor="deliveryTerms" 
                            helperText="Wird auf der Produktdetailseite und im Anfragekorb/Checkout angezeigt."
                        >
                            <AdminTextarea 
                                id="deliveryTerms" 
                                rows={6} 
                                value={deliveryTerms} 
                                onChange={(e) => setDeliveryTerms(e.target.value)} 
                                placeholder="Anfahrt und Lieferung werden nach Entfernung berechnet und im Zuge der Anfrage individuell vereinbart."
                            />
                        </AdminField>
                    </div>
                </AdminCard>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="sticky bottom-6 z-10 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg backdrop-blur-md">
                <p className="text-sm text-slate-500">Ihre Änderungen sind noch nicht gespeichert.</p>
                <AdminButton type="submit" disabled={saving}>
                    {saving ? "Speichert..." : "Einstellungen speichern"}
                </AdminButton>
            </div>
        </form>
    );
}
