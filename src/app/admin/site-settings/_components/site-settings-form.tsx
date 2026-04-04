"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Site Settings</h1>
                <p className="mt-1 text-sm text-neutral-600">
                    Zentrale Inhalte für Kontakt, Hero, Footer und allgemeine Infobereiche.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="space-y-4 rounded-xl border p-4">
                    <h2 className="text-lg font-semibold">Kontakt</h2>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Telefonnummer</label>
                        <input className="w-full rounded-md border px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">E-Mail</label>
                        <input className="w-full rounded-md border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Standort / Adresse</label>
                        <textarea className="min-h-[110px] w-full rounded-md border px-3 py-2" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Öffnungszeiten</label>
                        <textarea className="min-h-[110px] w-full rounded-md border px-3 py-2" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} />
                    </div>
                </section>

                <section className="space-y-4 rounded-xl border p-4">
                    <h2 className="text-lg font-semibold">Inhalte</h2>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Hero-Titel</label>
                        <input className="w-full rounded-md border px-3 py-2" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Hero-Text</label>
                        <textarea className="min-h-[110px] w-full rounded-md border px-3 py-2" value={heroText} onChange={(e) => setHeroText(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Hinweistexte</label>
                        <textarea className="min-h-[110px] w-full rounded-md border px-3 py-2" value={noticeText} onChange={(e) => setNoticeText(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Allgemeine Zusatzinfos</label>
                        <textarea className="min-h-[110px] w-full rounded-md border px-3 py-2" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} />
                    </div>
                </section>
            </div>

            <section className="space-y-4 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Social Links</h2>
                        <p className="text-sm text-neutral-600">Mehrere Plattformen zentral pflegen.</p>
                    </div>
                    <button type="button" onClick={addSocialLink} className="rounded-md border px-3 py-2 text-sm">
                        Link hinzufügen
                    </button>
                </div>

                <div className="space-y-3">
                    {socialLinks.map((link, index) => (
                        <div key={link.id} className="grid gap-3 rounded-lg border p-3 lg:grid-cols-[1fr_1fr_2fr_auto]">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Plattform</label>
                                <input
                                    className="w-full rounded-md border px-3 py-2"
                                    value={link.platform}
                                    onChange={(e) => updateSocialLink(link.id, { platform: e.target.value })}
                                    placeholder="Instagram"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Label</label>
                                <input
                                    className="w-full rounded-md border px-3 py-2"
                                    value={link.label}
                                    onChange={(e) => updateSocialLink(link.id, { label: e.target.value })}
                                    placeholder="Folge uns"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">URL</label>
                                <input
                                    className="w-full rounded-md border px-3 py-2"
                                    value={link.url}
                                    onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={link.isActive}
                                        onChange={(e) => updateSocialLink(link.id, { isActive: e.target.checked })}
                                    />
                                    Aktiv
                                </label>
                            </div>
                            <div className="lg:col-span-4 flex gap-2">
                                <button type="button" onClick={() => moveSocialLink(link.id, -1)} className="rounded-md border px-3 py-1.5 text-sm" disabled={index === 0}>
                                    Hoch
                                </button>
                                <button type="button" onClick={() => moveSocialLink(link.id, 1)} className="rounded-md border px-3 py-1.5 text-sm" disabled={index === socialLinks.length - 1}>
                                    Runter
                                </button>
                                <button type="button" onClick={() => removeSocialLink(link.id)} className="rounded-md border px-3 py-1.5 text-sm text-red-600">
                                    Entfernen
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button disabled={saving} className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60">
                {saving ? "Speichert..." : "Einstellungen speichern"}
            </button>
        </form>
    );
}
