import Link from 'next/link';
import { listFaqs } from '@/lib/repositories/faqs';
import { getPublicSiteSettings } from '@/lib/repositories/site-settings';
import { FaqAccordion } from '@/components/public/FaqAccordion';

export default async function FAQPage() {
    const [allFaqs, settings] = await Promise.all([listFaqs(), getPublicSiteSettings()]);
    const publishedFaqs = allFaqs.filter((faq) => faq.published);
    const phone = settings.phone?.trim() || '0123 456789';

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12 text-center">
                    <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-4">Häufig gestellte Fragen</h1>
                    <p className="font-['Inter'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[600px] mx-auto">
                        Hier finden Sie Antworten auf die wichtigsten Fragen rund um Buchung, Lieferung und Nutzung unserer Produkte.
                    </p>
                </div>

                <FaqAccordion faqs={publishedFaqs} />

                {publishedFaqs.length === 0 && (
                    <div className="text-center py-8 text-neutral-500">
                        Noch keine FAQs vorhanden.
                    </div>
                )}

                <div className="mt-12 bg-[#e2e8f0] rounded-[8px] p-8 text-center">
                    <h2 className="font-['Inter'] font-semibold text-[24px] text-[#1a202c] mb-3">Weitere Fragen?</h2>
                    <p className="font-['Inter'] text-[16px] text-[#4a5568] mb-6">Wir helfen Ihnen gerne weiter. Kontaktieren Sie uns per E-Mail oder Telefon.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/kontakt" className="inline-block bg-[#fbbf24] text-[#1a3a52] px-6 py-3 rounded-[8px] font-['Inter'] font-medium text-[16px] hover:opacity-90 transition-opacity">
                            Kontakt aufnehmen
                        </Link>
                        <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-block bg-white border border-[#cbd5e1] text-[#2d3748] px-6 py-3 rounded-[8px] font-['Inter'] font-medium text-[16px] hover:border-[#1a3a52] transition-colors">
                            {phone}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
