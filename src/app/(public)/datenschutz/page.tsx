import Link from "next/link";
import { getPublicSiteSettings } from "@/lib/repositories/site-settings";

export default async function DatenschutzPage() {
    const settings = await getPublicSiteSettings();

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <h1 className="mb-6 font-['Nunito'] text-[32px] font-semibold text-[#1a202c]">Datenschutz</h1>

                <div className="space-y-6 rounded-[16px] border border-[#cbd5e1] bg-[#f8fafc] p-6 sm:p-8">
                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">1. Verantwortlicher</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">GMF Eventmodule</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Inhaber: Georg Wilkl-Fuhry</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            {settings.address && settings.address.includes("16") ? settings.address : "Stranzendorf 16, 3702 Stranzendorf"}
                        </p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">E-Mail: {settings.email || "office@gmf-eventmodule.at"}</p>
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
                            uebermittelten Daten zur Bearbeitung Ihrer Anfrage und fuer eventuelle Anschlussfragen.
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
                            Daten werden nur so lange gespeichert, wie dies fuer die jeweiligen Zwecke erforderlich
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
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">7. Cookies und Drittanbieter</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Wir setzen auf dieser Website nur technisch notwendige Cookies ein (z. B. zur Speicherung Ihres Warenkorbs). Es werden keine Tracking- oder Marketing-Cookies von Drittanbietern verwendet. Sofern externe Ressourcen geladen werden, geschieht dies datenschutzkonform, um Ihre Privatsphaehre zu schuetzen.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">8. Verlinkte Dokumente</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Weitere rechtliche Informationen finden Sie im <Link href="/impressum" className="text-[#1a3a52] underline">Impressum</Link>.
                        </p>
                    </section>

                    <p className="border-t border-[#dbe3ee] pt-4 font-['Nunito'] text-[13px] text-[#64748b]">
                        Stand: 22. April 2026. Diese Datenschutzerklaerung ist eine Vorlage und ersetzt keine Rechtsberatung.
                    </p>
                </div>
            </div>
        </div>
    );
}
