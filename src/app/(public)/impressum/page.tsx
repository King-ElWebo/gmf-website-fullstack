import { getPublicSiteSettings } from "@/lib/repositories/site-settings";

export default async function ImpressumPage() {
    const settings = await getPublicSiteSettings();

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <h1 className="mb-6 font-['Nunito'] text-[32px] font-semibold text-[#1a202c]">Impressum</h1>

                <div className="space-y-6 rounded-[16px] border border-[#cbd5e1] bg-[#f8fafc] p-6 sm:p-8">
                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">Angaben gemaess ECG / UGB / GewO / MedienG</h2>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Medieninhaber und Diensteanbieter</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">GMF Eventmodule</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Inhaber: Georg Wilkl-Fuhry</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            {settings.address && settings.address.includes("16") ? settings.address : "Stranzendorf 16, 3702 Stranzendorf"}
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Kontakt</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">E-Mail: {settings.email || "office@gmf-eventmodule.at"}</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Telefon: {settings.phone || "+43 123 456789"}</p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Unternehmensdaten</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Unternehmensgegenstand: Vermietung von Eventmodulen, Hüpfburgen sowie Licht- und Tontechnik</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Rechtsform: Einzelunternehmen</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Firmenbuch: Nicht im Firmenbuch eingetragen (nicht eintragungspflichtig)</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">UID-Nummer: Umsatzsteuerbefreit aufgrund der Kleinunternehmerregelung</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Aufsichtsbehoerde: Bezirkshauptmannschaft Korneuburg</p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Berufsrechtliche Angaben</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Kammer / Berufsverband: Wirtschaftskammer Niederoesterreich (WKNOE)</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Gewerbeordnung: www.ris.bka.gv.at</p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Online-Streitbeilegung</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Verbraucher haben die Moeglichkeit, Beschwerden an die Online-Streitbeilegungsplattform
                            der EU zu richten: https://ec.europa.eu/consumers/odr/
                        </p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Sie koennen allfaellige Beschwerden auch an die oben angegebene E-Mail-Adresse richten.
                        </p>
                    </section>

                    <p className="border-t border-[#dbe3ee] pt-4 font-['Nunito'] text-[13px] text-[#64748b]">
                        Stand: 22. April 2026. Dieses Impressum ist eine Vorlage und ersetzt keine Rechtsberatung.
                    </p>
                </div>
            </div>
        </div>
    );
}
