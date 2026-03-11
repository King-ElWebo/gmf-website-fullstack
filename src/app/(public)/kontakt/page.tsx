"use client";

import React, { useState } from 'react';
import { Button } from '@/components/public/Button';
import { Input } from '@/components/public/Input';
import { Textarea } from '@/components/public/Textarea';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-[8px] border border-[#cbd5e1] p-8 md:p-12 text-center">
                        <div className="w-16 h-16 bg-[#fbbf24] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail size={32} className="text-[#1a3a52]" />
                        </div>
                        <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-4">Nachricht erfolgreich gesendet!</h1>
                        <p className="font-['Inter'] text-[16px] text-[#4a5568] leading-[25.6px] mb-8">Vielen Dank für Ihre Nachricht. Wir melden uns schnellstmöglich bei Ihnen.</p>
                        <Button variant="primary" onClick={() => setIsSubmitted(false)}>Weitere Nachricht senden</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12 text-center">
                    <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-4">Kontakt</h1>
                    <p className="font-['Inter'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[600px] mx-auto">
                        Haben Sie Fragen oder möchten Sie ein Angebot einholen? Wir sind gerne für Sie da!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <h2 className="font-['Inter'] font-semibold text-[24px] text-[#1a202c] mb-6">Kontaktinformationen</h2>
                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#e2e8f0] rounded-full flex items-center justify-center flex-shrink-0"><MapPin size={20} className="text-[#1a3a52]" /></div>
                                <div>
                                    <h3 className="font-['Inter'] font-medium text-[16px] text-[#1a202c] mb-1">Adresse</h3>
                                    <p className="font-['Inter'] text-[14px] text-[#4a5568] leading-[20px]">Musterstraße 123<br />12345 Musterstadt<br />Deutschland</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#e2e8f0] rounded-full flex items-center justify-center flex-shrink-0"><Phone size={20} className="text-[#1a3a52]" /></div>
                                <div>
                                    <h3 className="font-['Inter'] font-medium text-[16px] text-[#1a202c] mb-1">Telefon</h3>
                                    <p className="font-['Inter'] text-[14px] text-[#4a5568]">0123 456789</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#e2e8f0] rounded-full flex items-center justify-center flex-shrink-0"><Mail size={20} className="text-[#1a3a52]" /></div>
                                <div>
                                    <h3 className="font-['Inter'] font-medium text-[16px] text-[#1a202c] mb-1">E-Mail</h3>
                                    <p className="font-['Inter'] text-[14px] text-[#4a5568]">info@event-vermietung.de</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#e2e8f0] rounded-full flex items-center justify-center flex-shrink-0"><Clock size={20} className="text-[#1a3a52]" /></div>
                                <div>
                                    <h3 className="font-['Inter'] font-medium text-[16px] text-[#1a202c] mb-1">Öffnungszeiten</h3>
                                    <p className="font-['Inter'] text-[14px] text-[#4a5568] leading-[20px]">Montag - Freitag: 9:00 - 18:00 Uhr<br />Samstag: 10:00 - 14:00 Uhr<br />Sonntag: Geschlossen</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#e2e8f0] rounded-[8px] p-6 mb-8">
                            <h3 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-3">Lieferung & Abholung</h3>
                            <p className="font-['Inter'] text-[14px] text-[#4a5568] leading-[20px] mb-3">Wir liefern im Umkreis von 50km kostenlos. Für größere Entfernungen erstellen wir Ihnen gerne ein individuelles Angebot.</p>
                            <p className="font-['Inter'] text-[14px] text-[#4a5568] leading-[20px]">Selbstabholung ist nach Vereinbarung an unserem Standort möglich.</p>
                        </div>

                        <div>
                            <h3 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-4">Folgen Sie uns</h3>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-[#e2e8f0] hover:bg-[#cbd5e1] rounded-full flex items-center justify-center transition-colors"><Instagram size={20} className="text-[#1a3a52]" /></a>
                                <a href="#" className="w-10 h-10 bg-[#e2e8f0] hover:bg-[#cbd5e1] rounded-full flex items-center justify-center transition-colors"><Facebook size={20} className="text-[#1a3a52]" /></a>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-4">Standort</h3>
                            <div className="bg-[#e2e8f0] rounded-[8px] h-[300px] flex items-center justify-center border border-[#cbd5e1]">
                                <p className="font-['Inter'] text-[14px] text-[#64748b]">Google Maps Platzhalter</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-['Inter'] font-semibold text-[24px] text-[#1a202c] mb-6">Schreiben Sie uns</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input label="Name" type="text" name="name" placeholder="Max Mustermann" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            <Input label="E-Mail" type="email" name="email" placeholder="max@beispiel.de" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            <Input label="Telefon" type="tel" name="phone" placeholder="0123 456789" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            <Input label="Betreff" type="text" name="subject" placeholder="Worum geht es?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                            <Textarea label="Nachricht" name="message" placeholder="Ihre Nachricht an uns..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={8} required />
                            <Button type="submit" variant="primary" className="w-full">Anfrage senden</Button>
                        </form>
                        <div className="mt-6 bg-[#f7f8fa] rounded-[8px] p-4">
                            <p className="font-['Inter'] text-[12px] text-[#64748b] leading-[18px]">
                                Mit dem Absenden des Formulars stimmen Sie zu, dass Ihre Daten zur Bearbeitung Ihrer Anfrage verwendet werden. Weitere Informationen finden Sie in unserer Datenschutzerklärung.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
