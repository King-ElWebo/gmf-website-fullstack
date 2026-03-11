"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/public/Button';
import { Input } from '@/components/public/Input';
import { Textarea } from '@/components/public/Textarea';
import { Check } from 'lucide-react';

interface BuchungsItem {
    id: string;
    title: string;
    price: string | null;
    imageUrl: string;
}

const blockedDates = ['2026-02-15', '2026-02-22', '2026-03-08'];

export function BuchungsFormular({ item }: { item: BuchungsItem }) {
    const [formData, setFormData] = useState({ date: '', name: '', email: '', phone: '', address: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [dateError, setDateError] = useState('');

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        setDateError(blockedDates.includes(selectedDate) ? 'Dieser Termin ist leider nicht verfügbar. Bitte wählen Sie ein anderes Datum.' : '');
        setFormData({ ...formData, date: selectedDate });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (blockedDates.includes(formData.date)) { setDateError('Dieser Termin ist leider nicht verfügbar.'); return; }
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-[8px] border border-[#cbd5e1] p-8 md:p-12 text-center">
                        <div className="w-16 h-16 bg-[#fbbf24] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={32} className="text-[#1a3a52]" />
                        </div>
                        <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-4">Anfrage erfolgreich gesendet!</h1>
                        <p className="font-['Inter'] text-[16px] text-[#4a5568] leading-[25.6px] mb-8">
                            Vielen Dank für Ihre Buchungsanfrage für <strong>{item.title}</strong>. Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.
                        </p>
                        <div className="bg-[#e2e8f0] rounded-[8px] p-6 mb-8 text-left">
                            <p className="font-['Inter'] text-[14px] text-[#2d3748] mb-2"><strong>Gewünschtes Datum:</strong> {new Date(formData.date).toLocaleDateString('de-DE')}</p>
                            <p className="font-['Inter'] text-[14px] text-[#2d3748] mb-2"><strong>Name:</strong> {formData.name}</p>
                            <p className="font-['Inter'] text-[14px] text-[#2d3748]"><strong>E-Mail:</strong> {formData.email}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/"><Button variant="primary">Zur Startseite</Button></Link>
                            <Link href="/produkte"><Button variant="secondary">Weitere Produkte</Button></Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-[14px]">
                        <Link href="/" className="font-['Inter'] text-[#64748b] hover:text-[#1a3a52]">Start</Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <Link href="/produkte" className="font-['Inter'] text-[#64748b] hover:text-[#1a3a52]">Produkte</Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <Link href={`/produkt/${item.id}`} className="font-['Inter'] text-[#64748b] hover:text-[#1a3a52]">{item.title}</Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <span className="font-['Inter'] text-[#1a202c]">Buchung</span>
                    </nav>
                </div>

                <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-8">Buchungsanfrage</h1>

                <div className="bg-[#e2e8f0] rounded-[8px] p-6 mb-8 flex flex-col sm:flex-row gap-6">
                    {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-full sm:w-[150px] h-[100px] object-cover rounded-[8px]" />
                    )}
                    <div className="flex-1">
                        <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-2">{item.title}</h2>
                        {item.price && (
                            <p className="font-['Inter'] font-semibold text-[16px] text-[#4a5568]">{item.price}</p>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-4">Wunschtermin</h2>
                        <Input label="Datum" type="date" name="date" value={formData.date} onChange={handleDateChange} error={dateError} required />
                        {blockedDates.length > 0 && (
                            <div className="mt-4 bg-[#f7f8fa] rounded-[8px] p-4">
                                <p className="font-['Inter'] text-[14px] text-[#4a5568] mb-2"><strong>Bereits belegte Termine:</strong></p>
                                <ul className="space-y-1">
                                    {blockedDates.map(date => (
                                        <li key={date} className="font-['Inter'] text-[14px] text-[#64748b]">
                                            • {new Date(date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-4">Ihre Kontaktdaten</h2>
                        <div className="space-y-4">
                            <Input label="Name" type="text" name="name" placeholder="Max Mustermann" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            <Input label="E-Mail" type="email" name="email" placeholder="max@beispiel.de" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            <Input label="Telefon" type="tel" name="phone" placeholder="0123 456789" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                            <Input label="Adresse (optional)" type="text" name="address" placeholder="Straße, PLZ Ort" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <h2 className="font-['Inter'] font-medium text-[18px] text-[#1a202c] mb-4">Zusätzliche Informationen</h2>
                        <Textarea label="Nachricht (optional)" name="message" placeholder="Teilen Sie uns weitere Details zu Ihrer Veranstaltung mit..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={6} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button type="submit" variant="primary" disabled={!!dateError || !formData.date || !formData.name || !formData.email || !formData.phone} className="flex-1">Anfrage senden</Button>
                        <Link href={`/produkt/${item.id}`} className="flex-1">
                            <Button type="button" variant="secondary" className="w-full">Zurück zum Produkt</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
