export default function WiderrufPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <h1 className="mb-6 font-['Nunito'] text-[32px] font-semibold text-[#1a202c]">Widerrufsbelehrung</h1>

                <div className="space-y-6 rounded-[16px] border border-[#cbd5e1] bg-[#f8fafc] p-6 sm:p-8">
                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">Widerrufsrecht fuer Verbraucher</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Verbraucher haben grundsaetzlich das Recht, binnen 14 Tagen ohne Angabe von Gruenden
                            einen Vertrag zu widerrufen, sofern kein gesetzlicher Ausschlussgrund vorliegt.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">Widerrufsfrist</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Die Frist beginnt mit dem Tag des Vertragsabschlusses. Um das Widerrufsrecht auszuueben,
                            muss eine eindeutige Erklaerung (z. B. per E-Mail oder Post) uebermittelt werden.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">Folgen des Widerrufs</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Im Fall eines wirksamen Widerrufs werden bereits erhaltene Zahlungen gemaess den
                            gesetzlichen Vorgaben rueckerstattet.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">Ausschluss bzw. vorzeitiges Erloeschen</h2>
                        <p className="font-['Nunito'] text-[15px] leading-[24px] text-[#4a5568]">
                            Das Widerrufsrecht kann in bestimmten Faellen ausgeschlossen sein oder vorzeitig
                            erloeschen. Bitte ergaenzen Sie diesen Abschnitt entsprechend Ihrer konkreten
                            Vertragsabwicklung und Leistungen.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 font-['Nunito'] text-[20px] font-semibold text-[#1a202c]">Muster-Widerrufsformular</h2>
                        <div className="rounded-[12px] border border-[#dbe3ee] bg-white p-4">
                            <p className="font-['Nunito'] text-[14px] leading-[22px] text-[#4a5568]">
                                Wenn Sie den Vertrag widerrufen wollen, fuellen Sie bitte dieses Formular aus und senden Sie es zurueck:
                            </p>
                            <div className="mt-3 whitespace-pre-line font-['Nunito'] text-[14px] leading-[22px] text-[#4a5568]">
                                {`An:
[Name/Firma]
[Adresse]
[E-Mail]

Hiermit widerrufe ich den von mir abgeschlossenen Vertrag ueber die Anmietung der folgenden Waren/Dienstleistungen:
[Bezeichnung]

Bestellt am / erhalten am:
[Datum]

Name des Verbrauchers:
[Name]

Anschrift des Verbrauchers:
[Adresse]

Datum:
[Datum]

Unterschrift (nur bei Mitteilung auf Papier):
____________________`}
                            </div>
                        </div>
                    </section>

                    <p className="border-t border-[#dbe3ee] pt-4 font-['Nunito'] text-[13px] text-[#64748b]">
                        Stand: 22. April 2026. Diese Widerrufsbelehrung ist eine Vorlage und sollte rechtlich geprueft werden.
                    </p>
                </div>
            </div>
        </div>
    );
}
