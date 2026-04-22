import Link from "next/link";

export default function AgbPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <h1 className="mb-6 font-['Nunito'] text-[32px] font-semibold text-[#1a202c]">Allgemeine Geschaeftsbedingungen (AGB)</h1>

                <div className="space-y-6 rounded-[16px] border border-[#cbd5e1] bg-[#f8fafc] p-6 sm:p-8">
                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">1. Geltungsbereich</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Diese AGB gelten fuer die Vermietung von Eventmodulen und Zubehoer durch Event-Vermietung.
                            Abweichende Bedingungen des Kunden gelten nur, wenn diese ausdruecklich schriftlich
                            bestaetigt wurden.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">2. Angebot und Vertrag</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Angebote sind freibleibend. Ein Vertrag kommt erst durch ausdrueckliche Bestaetigung
                            des Vermieters zustande.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">3. Preise und Zahlung</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Es gelten die im Angebot oder in der Bestaetigung vereinbarten Preise. Zusatzleistungen
                            wie Lieferung, Abholung, Reinigung oder Sonderaufwand koennen gesondert verrechnet werden.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">4. Ruecktritt und Storno</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Es gelten die auf der Website bekanntgegebenen Stornobedingungen bzw. jene laut
                            individueller Vereinbarung.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">5. Nutzung und Haftung</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Der Mieter ist verpflichtet, die Mietgegenstaende sachgemaess und sicher zu verwenden.
                            Fuer Schaeden durch unsachgemaesse Nutzung haftet der Mieter im Rahmen der gesetzlichen
                            Bestimmungen.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">6. Schlussbestimmungen</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Es gilt oesterreichisches Recht. Gerichtsstand und zusaetzliche Klauseln sind je nach
                            Unternehmensform und Zielgruppe rechtlich zu pruefen und zu ergaenzen.
                        </p>
                    </section>

                    <p className="border-t border-[#dbe3ee] pt-4 font-['Nunito'] text-[13px] text-[#64748b]">
                        Stand: 22. April 2026. Diese AGB sind eine Vorlage und sollten vor Verwendung rechtlich geprueft werden.
                    </p>

                    <p className="font-['Nunito'] text-[14px] text-[#4a5568]">
                        Siehe auch: <Link href="/widerruf" className="text-[#1a3a52] underline">Widerrufsbelehrung</Link> und{" "}
                        <Link href="/datenschutz" className="text-[#1a3a52] underline">Datenschutz</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
