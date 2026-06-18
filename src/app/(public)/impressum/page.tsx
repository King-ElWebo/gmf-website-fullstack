import { getPublicSiteSettings } from "@/lib/repositories/site-settings";
import { COMPANY_CONFIG } from "@/lib/company-config";

export default async function ImpressumPage() {
    const settings = await getPublicSiteSettings();

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <h1 className="mb-6 font-['Nunito'] text-[32px] font-semibold text-[#1a202c]">Impressum</h1>

                <div className="space-y-6 rounded-[16px] border border-[#cbd5e1] bg-[#f8fafc] p-6 sm:p-8">
                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">Angaben gemäß ECG / UGB / GewO / MedienG</h2>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Medieninhaber und Diensteanbieter</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568] font-bold">{COMPANY_CONFIG.legalName}</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#64748b] italic">Markenname: {COMPANY_CONFIG.brandingName}</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            {settings.address || COMPANY_CONFIG.address}
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Kontakt</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            E-Mail: <a href={`mailto:${settings.email || COMPANY_CONFIG.emailPrimary}`} className="text-[#1a3a52] underline hover:text-[#0f2434]">{settings.email || COMPANY_CONFIG.emailPrimary}</a>
                            {(!settings.email || settings.email === COMPANY_CONFIG.emailPrimary) && (
                                <>
                                    {" "}(Primär) | Backup: <a href={`mailto:${COMPANY_CONFIG.emailSecondary}`} className="text-[#1a3a52] underline hover:text-[#0f2434]">{COMPANY_CONFIG.emailSecondary}</a>
                                </>
                            )}
                        </p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Telefon: <a href={COMPANY_CONFIG.phoneLink} className="text-[#1a3a52] underline hover:text-[#0f2434]">{settings.phone || COMPANY_CONFIG.phone}</a>
                        </p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Unternehmensdaten</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Unternehmensgegenstand: {COMPANY_CONFIG.activities}</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Rechtsform: Einzelunternehmen</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Firmenbuch: Nicht im Firmenbuch eingetragen (nicht eintragungspflichtig)</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">UID-Nummer: {COMPANY_CONFIG.uid}</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Aufsichtsbehoerde: {COMPANY_CONFIG.authority}</p>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Gerichtsstand: {COMPANY_CONFIG.court}</p>
                    </section>

                    <section>
                        <h3 className="mb-2 font-['Nunito'] text-[17px] font-semibold text-[#1a202c]">Berufsrechtliche Angaben</h3>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">Kammer / Berufsverband: {COMPANY_CONFIG.chamber}</p>
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
