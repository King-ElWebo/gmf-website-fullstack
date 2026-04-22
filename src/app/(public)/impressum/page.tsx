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
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Bitte pruefen und ergaenzen Sie die folgenden Angaben vor Livegang rechtlich.
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Medieninhaber und Diensteanbieter</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Event-Vermietung</p>
                        {settings.address ? (
                            <p className="whitespace-pre-line font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">{settings.address}</p>
                        ) : (
                            <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">[Adresse ergaenzen]</p>
                        )}
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Kontakt</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">E-Mail: {settings.email || "[E-Mail ergaenzen]"}</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Telefon: {settings.phone || "[Telefon ergaenzen]"}</p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Unternehmensdaten</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Unternehmensgegenstand: [Bitte ergaenzen]</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Rechtsform: [Bitte ergaenzen]</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Firmenbuchnummer: [Bitte ergaenzen]</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Firmenbuchgericht: [Bitte ergaenzen]</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">UID-Nummer: [Bitte ergaenzen]</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Aufsichtsbehoerde: [Bitte ergaenzen]</p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Berufsrechtliche Angaben</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Kammer / Berufsbezeichnung: [Bitte ergaenzen]</p>
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
