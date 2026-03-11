"use client";

import * as Accordion from '@radix-ui/react-accordion';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const faqs = [
    { question: 'Wie funktioniert die Buchung?', answer: 'Wählen Sie einfach Ihr gewünschtes Produkt aus, prüfen Sie die Verfügbarkeit für Ihren Wunschtermin und senden Sie uns eine Buchungsanfrage. Wir melden uns dann schnellstmöglich bei Ihnen zur Bestätigung.' },
    { question: 'Wie weit im Voraus muss ich buchen?', answer: 'Wir empfehlen eine Buchung mindestens 2-3 Wochen im Voraus, besonders in der Hochsaison (Frühjahr und Sommer). Kurzfristige Buchungen sind jedoch nach Verfügbarkeit möglich.' },
    { question: 'Wie erfolgt die Lieferung und der Aufbau?', answer: 'Im Umkreis von 50km ist die Lieferung inklusive. Unser Team liefert das Produkt, baut es auf und holt es nach der Veranstaltung wieder ab. Der Auf- und Abbau ist im Preis enthalten.' },
    { question: 'Kann ich die Hüpfburg auch selbst abholen?', answer: 'Ja, Selbstabholung ist möglich und reduziert den Mietpreis. Sie benötigen jedoch einen entsprechend großen Transportwagen und müssen den Auf- und Abbau selbst übernehmen. Eine Einweisung erfolgt bei Abholung.' },
    { question: 'Was passiert bei schlechtem Wetter?', answer: 'Bei schlechtem Wetter können Sie bis 24 Stunden vor dem Termin kostenlos umbuchen. Einige unserer Produkte sind auch für Indoor-Nutzung geeignet - sprechen Sie uns an!' },
    { question: 'Welche Voraussetzungen brauche ich vor Ort?', answer: 'Sie benötigen eine ebene Fläche, einen Stromanschluss (230V) in der Nähe und ausreichend Platz entsprechend der Produktmaße. Detaillierte Angaben finden Sie in der jeweiligen Produktbeschreibung.' },
    { question: 'Ist eine Versicherung im Preis enthalten?', answer: 'Ja, alle unsere Produkte sind haftpflichtversichert. Wir empfehlen dennoch eine Aufsicht durch Erwachsene während der Nutzung.' },
    { question: 'Wie erfolgt die Bezahlung?', answer: 'Die Bezahlung erfolgt nach der Veranstaltung per Rechnung. Wir akzeptieren Überweisung und gängige Zahlungsmethoden. Bei Erstbuchungen kann eine Anzahlung erforderlich sein.' },
    { question: 'Gibt es Rabatte bei längerer Mietdauer?', answer: 'Ja, bei Buchungen über mehrere Tage oder bei größeren Events bieten wir attraktive Rabatte an. Kontaktieren Sie uns für ein individuelles Angebot.' },
    { question: 'Was ist, wenn etwas beschädigt wird?', answer: 'Normale Gebrauchsspuren sind kein Problem. Bei vorsätzlichen Beschädigungen behalten wir uns vor, die Reparaturkosten in Rechnung zu stellen. Bitte gehen Sie sorgsam mit unseren Produkten um.' }
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12 text-center">
                    <h1 className="font-['Inter'] font-semibold text-[32px] text-[#1a202c] mb-4">Häufig gestellte Fragen</h1>
                    <p className="font-['Inter'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[600px] mx-auto">
                        Hier finden Sie Antworten auf die wichtigsten Fragen rund um Buchung, Lieferung und Nutzung unserer Produkte.
                    </p>
                </div>

                <Accordion.Root type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                        <Accordion.Item key={index} value={`item-${index}`} className="bg-white rounded-[8px] border border-[#cbd5e1] overflow-hidden">
                            <Accordion.Header>
                                <Accordion.Trigger className="w-full flex items-center justify-between p-6 text-left hover:bg-[#f7f8fa] transition-colors group">
                                    <span className="font-['Inter'] font-medium text-[16px] text-[#1a202c] pr-4">{faq.question}</span>
                                    <ChevronDown size={20} className="text-[#64748b] flex-shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                                </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                                <div className="px-6 pb-6">
                                    <p className="font-['Inter'] text-[14px] text-[#4a5568] leading-[22px]">{faq.answer}</p>
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>

                <div className="mt-12 bg-[#e2e8f0] rounded-[8px] p-8 text-center">
                    <h2 className="font-['Inter'] font-semibold text-[24px] text-[#1a202c] mb-3">Weitere Fragen?</h2>
                    <p className="font-['Inter'] text-[16px] text-[#4a5568] mb-6">Wir helfen Ihnen gerne weiter. Kontaktieren Sie uns per E-Mail oder Telefon.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/kontakt" className="inline-block bg-[#fbbf24] text-[#1a3a52] px-6 py-3 rounded-[8px] font-['Inter'] font-medium text-[16px] hover:opacity-90 transition-opacity">
                            Kontakt aufnehmen
                        </Link>
                        <a href="tel:0123456789" className="inline-block bg-white border border-[#cbd5e1] text-[#2d3748] px-6 py-3 rounded-[8px] font-['Inter'] font-medium text-[16px] hover:border-[#1a3a52] transition-colors">
                            0123 456789
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
