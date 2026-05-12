"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/public/Button';
import { Input } from '@/components/public/Input';
import { Textarea } from '@/components/public/Textarea';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';
import { CopyableContact } from '@/components/public/CopyableContact';
import type { SiteSettingsRecord } from '@/lib/repositories/site-settings';

interface ContactClientProps {
    settings: SiteSettingsRecord;
}

export function ContactClient({ settings }: ContactClientProps) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#fefce8]">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="bg-white rounded-[16px] border border-[#cbd5e1] p-6 sm:p-8 md:p-12 text-center">
                        <div className="w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail size={32} className="text-[#1a3a52]" />
                        </div>
                        <h1 className="font-['Nunito'] font-semibold text-[26px] sm:text-[32px] text-[#1a202c] mb-4">Nachricht erfolgreich gesendet!</h1>
                        <p className="font-['Nunito'] text-[16px] text-[#4a5568] leading-[25.6px] mb-8">Vielen Dank für Ihre Nachricht. Wir melden uns schnellstmöglich bei Ihnen.</p>
                        <Button variant="primary" onClick={() => setIsSubmitted(false)}>Weitere Nachricht senden</Button>
                    </div>
                </div>
            </div>
        );
    }

    const { address, phone, email, openingHours, socialLinks, additionalInfo } = settings;

    // Render formatted address (split by newlines if they exist)
    const renderAddress = () => {
        if (!address) return <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">-</p>;
        return address.split('\n').map((line, i) => (
            <span key={i}>
                {line}
                {i !== address.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    return (
        <div className="min-h-screen bg-[#fefce8]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="mb-8 sm:mb-12 text-center">
                    <h1 className="font-['Nunito'] font-semibold text-[28px] sm:text-[32px] text-[#1a202c] mb-3 sm:mb-4">Kontakt</h1>
                    <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#64748b] leading-[1.6] sm:leading-[25.6px] max-w-[600px] mx-auto">
                        Haben Sie Fragen oder möchten Sie ein Angebot einholen? Wir sind gerne für Sie da!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                    {/* LINKE SPALTE: Infos & Karte */}
                    <div>
                        <h2 className="font-['Nunito'] font-semibold text-[22px] sm:text-[24px] text-[#1a202c] mb-5 sm:mb-6">Kontaktinformationen</h2>
                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#fef9c3] rounded-full flex items-center justify-center shrink-0"><MapPin size={20} className="text-[#1a3a52]" /></div>
                                <div>
                                    <h3 className="font-['Nunito'] font-medium text-[16px] text-[#1a202c] mb-1">Adresse</h3>
                                    <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">{renderAddress()}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#fef9c3] rounded-full flex items-center justify-center shrink-0"><Phone size={20} className="text-[#1a3a52]" /></div>
                                <div>
                                    <h3 className="font-['Nunito'] font-medium text-[16px] text-[#1a202c] mb-1">Telefon</h3>
                                    {phone ? <CopyableContact value={phone} type="phone" textClassName="font-['Nunito'] text-[14px] text-[#4a5568]" /> : <p className="font-['Nunito'] text-[14px] text-[#4a5568]">-</p>}
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#fef9c3] rounded-full flex items-center justify-center shrink-0"><Mail size={20} className="text-[#1a3a52]" /></div>
                                <div>
                                    <h3 className="font-['Nunito'] font-medium text-[16px] text-[#1a202c] mb-1">E-Mail</h3>
                                    {email ? <CopyableContact value={email} type="email" textClassName="font-['Nunito'] text-[14px] text-[#4a5568]" /> : <p className="font-['Nunito'] text-[14px] text-[#4a5568]">-</p>}
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#fef9c3] rounded-full flex items-center justify-center shrink-0"><Clock size={20} className="text-[#1a3a52]" /></div>
                                <div>
                                    <h3 className="font-['Nunito'] font-medium text-[16px] text-[#1a202c] mb-1">Öffnungszeiten</h3>
                                    <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">{openingHours || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#fef9c3] rounded-[16px] p-5 sm:p-6 mb-8">
                            <h3 className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] mb-3">Lieferung & Abholung</h3>
                            <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px] mb-3">{additionalInfo || "Wir liefern je nach Entfernung direkt zu Ihnen. Die Lieferkosten werden individuell anhand der Strecke berechnet und im Zuge der Anfrage bekanntgegeben."}</p>
                            <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">Selbstabholung ist nach Vereinbarung an unserem Standort möglich. Bitte beachten Sie, dass die gemieteten Produkte auch wieder selbstständig und termingerecht retourniert werden müssen.</p>
                        </div>

                        {socialLinks && socialLinks.length > 0 && (
                            <div>
                                <h3 className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] mb-4">Folgen Sie uns</h3>
                                <div className="flex gap-4">
                                    {socialLinks.map((link) => {
                                        const platformStr = link.platform.toLowerCase();
                                        let Icon = null;
                                        if (platformStr.includes('instagram')) Icon = Instagram;
                                        else if (platformStr.includes('facebook')) Icon = Facebook;

                                        return (
                                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="h-12 w-12 bg-[#fef9c3] hover:bg-[#cbd5e1] rounded-full flex items-center justify-center transition-colors">
                                                {Icon ? <Icon size={20} className="text-[#1a3a52]" /> : <span className="text-[#1a3a52] text-xs font-bold">{link.platform.substring(0, 2).toUpperCase()}</span>}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* MAP BEREICH */}
                        <div className="mt-8">
                            <h3 className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] mb-4">Standort</h3>
                            <div className="bg-[#fef9c3] rounded-[16px] h-[240px] sm:h-[300px] flex items-center justify-center border border-[#cbd5e1] overflow-hidden">
                                <iframe
                                    title="Google Maps Karte zum Standort GMF Eventmodule"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2652.3718250777197!2d16.357130356852537!3d48.3341579974037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476d0fbf7cc77e57%3A0x6d03f6c40f987f39!2sSpargelfeldgasse%2022%2C%202102%20Bisamberg!5e0!3m2!1sde!2sat!4v1773320289705!5m2!1sde!2sat"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </div> {/* ENDE LINKE SPALTE */}

                    {/* RECHTE SPALTE: Formular */}
                    <div>
                        <h2 className="font-['Nunito'] font-semibold text-[22px] sm:text-[24px] text-[#1a202c] mb-5 sm:mb-6">Schreiben Sie uns</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input label="Name" type="text" name="name" placeholder="Max Mustermann" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            <Input label="E-Mail" type="email" name="email" placeholder="max@beispiel.de" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            <Input label="Telefon" type="tel" name="phone" placeholder="0123 456789" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            <Input label="Betreff" type="text" name="subject" placeholder="Worum geht es?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                            <Textarea label="Nachricht" name="message" placeholder="Ihre Nachricht an uns..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={8} required />
                            <Button type="submit" variant="primary" className="w-full">Anfrage senden</Button>
                        </form>
                        <div className="mt-6 bg-[#f7f8fa] rounded-[16px] p-4">
                            <p className="font-['Nunito'] text-[12px] text-[#64748b] leading-[18px]">
                                Mit dem Absenden des Formulars stimmen Sie zu, dass Ihre Daten zur Bearbeitung Ihrer Anfrage verwendet werden. Weitere Informationen finden Sie in unserer{" "}
                                <Link href="/datenschutz" className="text-[#1a3a52] underline hover:text-[#0f2434]">Datenschutzerklärung</Link>.
                            </p>
                        </div>
                    </div> {/* ENDE RECHTE SPALTE */}
                </div>
            </div>
        </div>
    );
}
