import Link from 'next/link';
import { ShieldCheck, CloudRain, Clock, AlertTriangle, FileText, Info } from 'lucide-react';
import { listFaqs } from '@/lib/repositories/faqs';
import { getPublicSiteSettings } from '@/lib/repositories/site-settings';
import { FaqAccordion } from '@/components/public/FaqAccordion';

export default async function FAQPage() {
    const [allFaqs, settings] = await Promise.all([listFaqs(), getPublicSiteSettings()]);
    const publishedFaqs = allFaqs.filter((faq: any) => faq.published);
    const phone = settings.phone?.trim() || '0123 456789';

    return (
        <div className="min-h-screen bg-[#fefce8]">
            <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="mb-8 sm:mb-12 text-center">
                    <h1 className="font-['Nunito'] font-semibold text-[28px] sm:text-[32px] text-[#1a202c] mb-3 sm:mb-4">Häufig gestellte Fragen</h1>
                    <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#64748b] leading-[1.6] sm:leading-[25.6px] max-w-[600px] mx-auto">
                        Hier finden Sie Antworten auf die wichtigsten Fragen rund um Buchung, Lieferung und Nutzung unserer Produkte.
                    </p>
                </div>

                <FaqAccordion faqs={publishedFaqs} />

                {publishedFaqs.length === 0 && (
                    <div className="text-center py-8 text-neutral-500">
                        Noch keine FAQs vorhanden.
                    </div>
                )}

                {/* STORNO REGELN BEREICH */}
                <div className="mt-12 sm:mt-16 mb-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fef3c7] text-[#d97706] mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="font-['Nunito'] font-semibold text-[24px] sm:text-[28px] text-[#1a202c] mb-2">Unsere Stornobedingungen</h2>
                        <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#64748b] max-w-[600px] mx-auto">
                            Damit Sie unbesorgt planen können, haben wir faire und transparente Stornoregeln für Sie entwickelt.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 2 Tage Storno - Kostenlos */}
                        <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#ecfdf5] rounded-bl-full z-0"></div>
                            <div className="relative z-10 flex items-start gap-4">
                                <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-[#d1fae5] flex items-center justify-center text-[#059669]">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="font-['Nunito'] font-semibold text-[18px] text-[#1a202c] mb-1">Kostenlos Stornieren</h3>
                                    <p className="font-['Nunito'] font-medium text-[#059669] mb-2">Bis 2 Tage vor Event-Beginn</p>
                                    <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-normal">Bis zu 2 Tage vor dem vereinbarten Mietbeginn können Sie Ihre Buchung komplett kostenlos und ohne Angabe von Gründen stornieren.</p>
                                </div>
                            </div>
                        </div>

                        {/* Spätere Storno */}
                        <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#fffbeb] rounded-bl-full z-0"></div>
                            <div className="relative z-10 flex items-start gap-4">
                                <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#d97706]">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-['Nunito'] font-semibold text-[18px] text-[#1a202c] mb-1">Spätere Stornierung</h3>
                                    <p className="font-['Nunito'] font-medium text-[#d97706] mb-2">Unter 2 Tage vor Termin</p>
                                    <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-normal">Bei einer Stornierung weniger als 2 Tage vor dem Mietbeginn berechnen wir die tatsächlich entstandenen Kosten bis maximal 350 € netto.</p>
                                </div>
                            </div>
                        </div>

                        {/* Schlechtwetter-Storno */}
                        <div className="bg-[#fffbeb] border border-[#cbd5e1] rounded-[16px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#e0f2fe] rounded-bl-full z-0"></div>
                            <div className="relative z-10 flex items-start gap-4">
                                <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-[#e0f2fe] flex items-center justify-center text-[#0284c7]">
                                    <CloudRain size={20} />
                                </div>
                                <div>
                                    <h3 className="font-['Nunito'] font-semibold text-[18px] text-[#1a202c] mb-1">Schlechtwetter-Option</h3>
                                    <p className="font-['Nunito'] font-medium text-[#0284c7] mb-2">Bei starkem Regen oder Sturm</p>
                                    <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-normal">Bei starkem Regen oder Sturm dürfen Hüpfburgen nicht betrieben werden. Hierfür bieten wir individuelle Vereinbarungen und kulante Lösungen an.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HAFTUNG & VERSICHERUNG BEREICH */}
                <div className="mt-12 mb-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f1f5f9] text-[#475569] mb-4">
                            <FileText size={24} />
                        </div>
                        <h2 className="font-['Nunito'] font-semibold text-[28px] text-[#1a202c] mb-2">Haftung & Versicherung</h2>
                        <p className="font-['Nunito'] text-[16px] text-[#64748b] max-w-[600px] mx-auto">
                            Wichtige Hinweise zur Nutzung unserer Mietobjekte.
                        </p>
                    </div>

                    <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-6 sm:p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Info className="text-[#3b82f6] shrink-0" size={18} />
                                    <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c]">Keine Versicherung</h3>
                                </div>
                                <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-normal">
                                    Es besteht <strong>keine</strong> Versicherung über den Anbieter. Eine allfällige Haftpflicht- oder Unfallversicherung liegt in der Verantwortung des Mieters.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheck className="text-[#3b82f6] shrink-0" size={18} />
                                    <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c]">Ausschließliche Vermietung</h3>
                                </div>
                                <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-normal">
                                    Der Betreiber handelt ausschließlich als Vermieter der Produkte. Es wird keine Betreuung oder Aufsicht während der Nutzung übernommen.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="text-[#3b82f6] shrink-0" size={18} />
                                    <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c]">Haftungsausschluss</h3>
                                </div>
                                <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-normal">
                                    Die Haftung für Schäden oder Verletzungen liegt <strong>nicht beim Anbieter</strong>, sondern ausschließlich beim jeweiligen Nutzer bzw. Mieter.
                                </p>
                            </div>

                        </div>
                        
                        <div className="mt-6 pt-5 border-t border-[#f1f5f9]">
                            <p className="font-['Nunito'] text-[13px] text-[#64748b] leading-normal">
                                Hinweis: Weitere detaillierte Haftungsinformationen und Allgemeine Geschäftsbedingungen erhalten Sie auf Anfrage oder vor Abschluss des finalen Mietvertrags.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-[#fef9c3] rounded-[16px] p-5 sm:p-8 text-center">
                    <h2 className="font-['Nunito'] font-semibold text-[22px] sm:text-[24px] text-[#1a202c] mb-3">Weitere Fragen?</h2>
                    <p className="font-['Nunito'] text-[16px] text-[#4a5568] mb-6">Wir helfen Ihnen gerne weiter. Kontaktieren Sie uns per E-Mail oder Telefon.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/kontakt" className="inline-flex items-center justify-center bg-[#3b82f6] text-white px-6 h-[50px] rounded-[16px] font-['Nunito'] font-medium text-[16px] shadow-sm transition-all hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2">
                            Kontakt aufnehmen
                        </Link>
                        <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-flex items-center justify-center bg-white border border-[#cbd5e1] text-[#2d3748] px-6 h-[50px] rounded-[16px] font-['Nunito'] font-medium text-[16px] shadow-sm transition-all hover:border-[#1a3a52] hover:bg-[#f7f8fa] focus:outline-none focus:ring-2 focus:ring-[#1a3a52] focus:ring-offset-2">
                            {phone}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
