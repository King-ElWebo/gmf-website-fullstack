import Link from "next/link";
import { getPublicSiteSettings } from "@/lib/repositories/site-settings";
import { COMPANY_CONFIG } from "@/lib/company-config";

export default async function DatenschutzPage() {
    const settings = await getPublicSiteSettings();

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <h1 className="mb-6 font-['Nunito'] text-[32px] font-semibold text-[#1a202c]">Datenschutz</h1>

                <div className="space-y-6 rounded-[16px] border border-[#cbd5e1] bg-[#f8fafc] p-6 sm:p-8">
                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">1. Verantwortlicher</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568] font-bold">{COMPANY_CONFIG.legalName}</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#64748b] italic">Markenname: {COMPANY_CONFIG.brandingName}</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            {settings.address || COMPANY_CONFIG.address}
                        </p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            E-Mail: <a href={`mailto:${settings.email || COMPANY_CONFIG.emailPrimary}`} className="text-[#1a3a52] underline hover:text-[#0f2434]">{settings.email || COMPANY_CONFIG.emailPrimary}</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">2. Verarbeitung personenbezogener Daten</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Wir verarbeiten personenbezogene Daten nur im erforderlichen Umfang, um diese Website
                            bereitzustellen, Anfragen zu beantworten und vertragliche Leistungen zu erbringen.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">3. Kontaktanfragen</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Wenn Sie uns kontaktieren (z. B. per Formular, E-Mail oder Telefon), verarbeiten wir die
                            übermittelten Daten zur Bearbeitung Ihrer Anfrage und für eventuelle Anschlussfragen.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">4. Server-Logfiles</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Beim Besuch dieser Website koennen technisch notwendige Logdaten verarbeitet werden
                            (z. B. IP-Adresse, Zeitpunkt, angeforderte Ressource, Browserinformationen).
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">5. Speicherdauer</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Daten werden nur so lange gespeichert, wie dies für die jeweiligen Zwecke erforderlich
                            ist oder gesetzliche Aufbewahrungspflichten bestehen.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">6. Ihre Rechte</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Ihnen stehen die Rechte auf Auskunft, Berichtigung, Loeschung, Einschraenkung, Datenuebertragbarkeit,
                            Widerruf und Widerspruch zu. Wenn Sie der Ansicht sind, dass die Verarbeitung gegen
                            Datenschutzrecht verstoest, koennen Sie sich bei der Datenschutzbehoerde beschweren.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">7. Cookies und Einwilligungsmanagement</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568] mb-3">
                            Wir setzen auf dieser Website Cookies und ähnliche Technologien ein. Diese lassen sich in folgende Kategorien unterteilen:
                        </p>
                        <ul className="list-disc pl-5 font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568] mb-3 space-y-2">
                            <li>
                                <strong>Essenziell:</strong> Diese Cookies sind technisch notwendig für den Betrieb der Website (z. B. Speicherung Ihres Anfragekorbs, Admin-Login, Speicherung Ihrer Cookie-Einwilligung). Sie können nicht deaktiviert werden.
                            </li>
                            <li>
                                <strong>Analytics & Statistiken:</strong> Optionale Cookies (z. B. Google Analytics), die uns helfen zu verstehen, wie Besucher mit unserer Website interagieren. Diese werden <strong>nur</strong> gesetzt, wenn Sie explizit über unser Cookie-Banner zustimmen.
                            </li>
                            <li>
                                <strong>Marketing:</strong> Optionale Cookies von Drittanbietern (z. B. für Werbeanzeigen). Auch diese werden <strong>nur nach Ihrer ausdrücklichen Zustimmung</strong> geladen.
                            </li>
                        </ul>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Sie können Ihre Einwilligung jederzeit für die Zukunft widerrufen oder anpassen, indem Sie auf den Link „Cookie-Einstellungen“ am unteren Rand der Website klicken. Wir verwenden außerdem den Google Consent Mode v2, der sicherstellt, dass vor Ihrer Zustimmung keine nutzerbezogenen Daten an Google-Dienste gesendet werden.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">8. Bildaufnahmen auf Veranstaltungen</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Auf Veranstaltungen, bei denen wir als Vermieter oder Dienstleister tätig sind, können unter Umständen 
                            Bild- und Videoaufnahmen unserer eingesetzten Produkte und Module angefertigt werden, um diese zu 
                            Dokumentations- und Werbezwecken (z.B. Website, Social Media) zu nutzen. Die Verarbeitung stützt sich 
                            hierbei auf unser berechtigtes Interesse gemäß Art. 6 Abs. 1 lit. f DSGVO. Es wird darauf geachtet, 
                            dass Personen entweder nicht im Fokus stehen oder unkenntlich gemacht werden. Werden Personen gezielt 
                            fotografiert, holen wir vorab eine entsprechende Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO ein.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">9. Verlinkte Dokumente</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Weitere rechtliche Informationen finden Sie im <Link href="/impressum" className="text-[#1a3a52] underline">Impressum</Link>.
                        </p>
                    </section>

                    <p className="border-t border-[#dbe3ee] pt-4 font-['Nunito'] text-[13px] text-[#64748b]">
                        Stand: 22. April 2026.
                    </p>
                </div>
            </div>
        </div>
    );
}
