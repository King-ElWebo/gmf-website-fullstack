import Image from "next/image";
import { Instagram, Facebook } from "lucide-react";
import { DisplayArea } from "@/lib/display-area";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { CategoryCarousel } from "@/components/public/CategoryCarousel";
import { CopyableContact } from "@/components/public/CopyableContact";
import { listGlobalImages } from "@/lib/repositories/global-images";
import { listCategories } from "@/lib/repositories/catalog";
import { getPublicSiteSettings } from "@/lib/repositories/site-settings";

export default async function HomePage() {
    const [carouselImages, socialImages, categories, settings] = await Promise.all([
        listGlobalImages({ area: DisplayArea.CAROUSEL, published: true }),
        listGlobalImages({ area: DisplayArea.SOCIAL, published: true }),
        listCategories(),
        getPublicSiteSettings(),
    ]);

    const heroCarouselImages = carouselImages.map((image) => ({
        url: image.url,
        alt: image.alt,
    }));

    const socialPreviewImages = socialImages.slice(0, 4);
    const socialLinks = settings.socialLinks.filter((link: { platform: string; label: string | null; url: string }) =>
        ["instagram", "facebook"].includes(link.platform.toLowerCase())
    );
    const instagramLink = socialLinks.find((link: { platform: string }) => link.platform.toLowerCase() === "instagram");
    const facebookLink = socialLinks.find((link: { platform: string }) => link.platform.toLowerCase() === "facebook");

    const heroTitle = settings.heroTitle?.trim() || "Unvergessliche Events für Groß und Klein";
    const heroText =
        settings.heroText?.trim() ||
        "Hüpfburgen und Eventmodule für Ihre Feier. Einfach buchen, sicher aufbauen, Spaß haben.";
    const locationInfo =
        settings.additionalInfo?.trim() ||
        "Wir liefern je nach Entfernung direkt zu Ihnen. Die Lieferkosten werden individuell anhand der Strecke berechnet und im Zuge der Anfrage bekanntgegeben.\n\nSelbstabholung ist nach Vereinbarung an unserem Standort möglich. Bitte beachten Sie, dass die gemieteten Produkte auch wieder selbstständig und termingerecht retourniert werden müssen.";

    return (
        <div className="min-h-screen bg-[#fefce8]">
            <HeroCarousel
                images={heroCarouselImages}
                title={heroTitle}
                text={heroText}
                noticeText={settings.noticeText?.trim() || null}
            />

            <CategoryCarousel
                categories={categories.map((category) => ({
                    id: category.id,
                    title: category.name,
                    description: category.description,
                    imageUrl: category.imageUrl,
                    slug: category.slug,
                    catalogTypeName: category.catalogType.name,
                    catalogTypeSlug: category.catalogType.slug,
                }))}
            />

            <section className="py-20 sm:py-32 bg-[#fefce8]">
                <div className="max-w-[850px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-block bg-[#f13c20] text-white px-3 py-1 rounded-lg text-[12px] font-bold uppercase tracking-widest mb-6">
                        Willkommen
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(2.2rem,8vw,3.2rem)] text-[#f13c20] mb-8 leading-tight">
                        Ihr bunter Eventmodule Verleih
                    </h2>
                    <div className="space-y-6">
                        <p className="font-['Nunito'] text-[18px] sm:text-[20px] text-[#2d3748] leading-relaxed font-medium">
                            Planen Sie eine unvergessliche <strong>Hochzeit</strong>, einen aufregenden <strong>Kindergeburtstag</strong> oder ein professionelles <strong>Outdoor Event</strong>?
                        </p>
                        <p className="font-['Nunito'] text-[16px] sm:text-[17px] text-[#4a5568] leading-[1.8]">
                            Bei uns können Sie hochwertige <strong>Eventmodule mieten</strong> – flexibel buchbar und perfekt für jede Art von privaten Feiern oder Sommerfesten.
                            Egal ob Sie eine bunte <strong>Hüpfburg mieten</strong> möchten für strahlende Kinderaugen, eine romantische <strong>Candybar</strong> für Ihre Hozeit ausstatten wollen oder professionelle <strong>Ton- und Lichttechnik mieten</strong>.
                        </p>
                        <p className="font-['Nunito'] text-[16px] sm:text-[17px] text-[#4a5568] leading-[1.8]">
                            Wir sind Ihr Ansprechpartner für <strong>Party Soundanlagen</strong>, Rutschen, Kinderspiele und Eventtechnik in der Region. Vertrauen Sie auf unseren Eventservice mit Abholung oder bequemer Lieferung direkt zu Ihrer <strong>Feier in Niederösterreich</strong>.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-14 sm:py-20 bg-cover bg-center relative" style={{ backgroundColor: '#dbf4ff', backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 11%), radial-gradient(circle, #fff 10%, transparent 11%)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}>
                {/* Top soft wave */}
                <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none rotate-180">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.15,192.27,108.83,235.15,98.81,278.4,79.91,321.39,56.44Z" className="fill-[#fefce8]"></path>
                    </svg>
                </div>
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="inline-block bg-white px-5 sm:px-8 py-2 sm:py-3 rounded-full border-4 border-black shadow-[4px_4px_0_#000] mb-8 sm:mb-12 mx-auto justify-center flex hover:rotate-2 transition-transform">
                        <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[22px] sm:text-[28px] md:text-[36px] text-black">
                            So funktioniert's! 🎈
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
                        <div className="bg-white rounded-[24px] p-5 sm:p-8 border-4 border-black text-center shadow-[6px_6px_0_#000] hover:-translate-y-2 hover:shadow-[8px_8px_0_#000] transition-all relative">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#f13c20] rounded-full flex items-center justify-center border-4 border-black shadow-[2px_2px_0_#000]">
                                <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[24px] text-white">1</span>
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[20px] sm:text-[22px] text-black mb-2 sm:mb-3 mt-4">
                                Eventausstattung wählen
                            </h3>
                            <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">
                                Ob Hüpfburg für Kinder, Partyzubehör oder Candybar für die Hochzeit – wählen Sie passendes Zubehör in unserem Verleih.
                            </p>
                        </div>

                        <div className="bg-white rounded-[24px] p-5 sm:p-8 border-4 border-black text-center shadow-[6px_6px_0_#000] hover:-translate-y-2 hover:shadow-[8px_8px_0_#000] transition-all relative mt-6 md:mt-0">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#fcd01b] rounded-full flex items-center justify-center border-4 border-black shadow-[2px_2px_0_#000]">
                                <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[24px] text-black">2</span>
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[20px] sm:text-[22px] text-black mb-2 sm:mb-3 mt-4">
                                Unverbindliche Anfrage
                            </h3>
                            <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">
                                Senden Sie uns unverbindlich Ihre Wunschliste für das anstehende Vereinsfest, Sommerfest oder den Geburtstag.
                            </p>
                        </div>

                        <div className="bg-white rounded-[24px] p-5 sm:p-8 border-4 border-black text-center shadow-[6px_6px_0_#000] hover:-translate-y-2 hover:shadow-[8px_8px_0_#000] transition-all relative mt-6 md:mt-0">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#066bb7] rounded-full flex items-center justify-center border-4 border-black shadow-[2px_2px_0_#000]">
                                <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[24px] text-white">3</span>
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[20px] sm:text-[22px] text-black mb-2 sm:mb-3 mt-4">
                                Lieferung & Service
                            </h3>
                            <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">
                                Egal ob flexible Selbstabholung oder bequeme Lieferung samt Aufbau Service in Niederösterreich.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom soft wave */}
                <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.15,192.27,108.83,235.15,98.81,278.4,79.91,321.39,56.44Z" className="fill-white"></path>
                    </svg>
                </div>
            </section>

            <section className="py-14 sm:py-20 bg-white">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                        <div className="bg-[#e7ff19] p-5 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[32px] border-4 border-black shadow-[8px_8px_0_#000] rotate-0 sm:rotate-[-1deg]">
                            <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[24px] sm:text-[28px] md:text-[36px] text-black mb-5 sm:mb-6">
                                📍 Standort & Abholung
                            </h2>
                            <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#4a5568] leading-[1.7] sm:leading-[25.6px] whitespace-pre-line mb-6">
                                {locationInfo}
                            </p>
                            <div className="space-y-3">
                                <p className="font-['Nunito'] text-[14px] text-[#2d3748]">
                                    <strong>Adresse:</strong> {settings.address?.trim() || "Spargelfeldgasse 22, 3702 Stranzendorf"}
                                </p>
                                <p className="font-['Nunito'] text-[14px] text-[#2d3748]">
                                    <strong>Öffnungszeiten:</strong> {settings.openingHours?.trim() || "nach telefonischer Vereinbarung"}
                                </p>
                                {settings.phone && (
                                    <div className="font-['Nunito'] text-[14px] text-[#2d3748] flex items-center gap-1 break-all">
                                        <strong>Telefon:</strong> <CopyableContact value={settings.phone} type="phone" textClassName="text-[#2d3748]" />
                                    </div>
                                )}
                                {settings.email && (
                                    <div className="font-['Nunito'] text-[14px] text-[#2d3748] flex items-center gap-1 break-all">
                                        <strong>E-Mail:</strong> <CopyableContact value={settings.email} type="email" textClassName="text-[#2d3748]" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#fef9c3] rounded-[16px] h-[240px] sm:h-[300px] flex items-center justify-center border border-[#cbd5e1] overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2652.3718250777197!2d16.357130356852537!3d48.3341579974037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476d0fbf7cc77e57%3A0x6d03f6c40f987f39!2sSpargelfeldgasse%2022%2C%202102%20Bisamberg!5e0!3m2!1sde!2sat!4v1773320289705!5m2!1sde!2sat"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {(socialPreviewImages.length > 0 || socialLinks.length > 0) && (
                <section className="py-14 sm:py-20 bg-[#fde047] relative">
                    {/* Top soft wave */}
                    <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none rotate-180">
                        <svg className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,123.15,192.27,108.83,235.15,98.81,278.4,79.91,321.39,56.44Z" className="fill-white"></path>
                        </svg>
                    </div>
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(1.85rem,8vw,2.6rem)] text-black mb-3 sm:mb-4 text-center">
                            📸 Folgen Sie uns!
                        </h2>
                        <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#64748b] mb-6 sm:mb-8 text-center">
                            Sehen Sie Impressionen von unseren Events auf Instagram und Facebook.
                        </p>

                        {socialPreviewImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {socialPreviewImages.map((image) => (
                                    <div key={image.id} className="relative bg-white rounded-[16px] aspect-square border border-[#cbd5e1]">
                                        <Image
                                            src={image.url}
                                            alt={image.alt ?? "Social Media Image"}
                                            fill
                                            className="object-cover rounded-[16px]"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                            {instagramLink && (
                                <a
                                    href={instagramLink.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 bg-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-[16px] border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] transition-all"
                                >
                                    <Instagram size={20} className="text-[#1a3a52]" />
                                    <span className="font-['Nunito'] font-bold text-[15px] text-[#2d3748]">
                                        {instagramLink.label?.trim() || "Instagram"}
                                    </span>
                                </a>
                            )}
                            {facebookLink && (
                                <a
                                    href={facebookLink.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 bg-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-[16px] border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] transition-all"
                                >
                                    <Facebook size={20} className="text-[#1a3a52]" />
                                    <span className="font-['Nunito'] font-bold text-[15px] text-[#2d3748]">
                                        {facebookLink.label?.trim() || "Facebook"}
                                    </span>
                                </a>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
