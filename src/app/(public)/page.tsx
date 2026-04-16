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
                    description: (category as any).description,
                    imageUrl: (category as any).imageUrl,
                    slug: category.slug,
                    catalogTypeName: category.catalogType.name,
                    catalogTypeSlug: category.catalogType.slug,
                }))}
            />

            <section className="py-16 bg-[#fefce8] border-t border-b border-[#fef08a]">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-['Nunito'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-6">
                        Ihr zuverlässiger Eventmodule Verleih
                    </h2>
                    <p className="font-['Nunito'] text-[16px] text-[#4a5568] leading-[28px] mb-4">
                        Planen Sie eine unvergessliche <strong className="font-medium text-[#1a202c]">Hochzeit</strong>, einen aufregenden <strong className="font-medium text-[#1a202c]">Kindergeburtstag</strong> oder ein professionelles <strong className="font-medium text-[#1a202c]">Outdoor Event</strong>? Bei uns können Sie hochwertige <strong>Eventmodule mieten</strong> – flexibel buchbar und perfekt für jede Art von privaten Feiern oder Sommerfesten.
                    </p>
                    <p className="font-['Nunito'] text-[16px] text-[#4a5568] leading-[28px]">
                        Egal ob Sie eine bunte <strong>Hüpfburg mieten</strong> möchten für strahlende Kinderaugen, eine romantische <strong>Candybar</strong> für Ihre Hochzeitsfeier ausstatten wollen oder professionelle <strong>Ton- und Lichttechnik mieten</strong>. Wir sind Ihr Ansprechpartner für <strong>Party Soundanlagen</strong>, Rutschen, Kinderspiele und Eventtechnik in der Region. Vertrauen Sie auf unseren Eventservice mit Abholung oder bequemer Lieferung direkt zu Ihrer <strong>Feier in Niederösterreich und Umgebung</strong>.
                    </p>
                </div>
            </section>

            <section className="py-16 bg-[#fffbeb]">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-['Nunito'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-12 text-center">
                        So funktioniert&apos;s
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-[16px] p-8 border border-[#cbd5e1] text-center shadow-sm">
                            <div className="w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="font-['Nunito'] font-semibold text-[24px] text-[#1a3a52]">1</span>
                            </div>
                            <h3 className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] mb-2">
                                Eventausstattung wählen
                            </h3>
                            <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">
                                Ob Hüpfburg für Kinder, Partyzubehör oder Candybar für die Hochzeit – wählen Sie passendes Zubehör in unserem Verleih.
                            </p>
                        </div>

                        <div className="bg-white rounded-[16px] p-8 border border-[#cbd5e1] text-center shadow-sm">
                            <div className="w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="font-['Nunito'] font-semibold text-[24px] text-[#1a3a52]">2</span>
                            </div>
                            <h3 className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] mb-2">
                                Unverbindliche Anfrage
                            </h3>
                            <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">
                                Senden Sie uns unverbindlich Ihre Wunschliste für das anstehende Vereinsfest, Sommerfest oder den Geburtstag.
                            </p>
                        </div>

                        <div className="bg-white rounded-[16px] p-8 border border-[#cbd5e1] text-center shadow-sm">
                            <div className="w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="font-['Nunito'] font-semibold text-[24px] text-[#1a3a52]">3</span>
                            </div>
                            <h3 className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] mb-2">
                                Lieferung &amp; Service
                            </h3>
                            <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[20px]">
                                Egal ob flexible Selbstabholung oder bequeme Lieferung samt Aufbau Service in Niederösterreich.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-['Nunito'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-4">
                                Standort & Abholung
                            </h2>
                            <p className="font-['Nunito'] text-[16px] text-[#4a5568] leading-[25.6px] whitespace-pre-line mb-6">
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
                                    <div className="font-['Nunito'] text-[14px] text-[#2d3748] flex items-center gap-1">
                                        <strong>Telefon:</strong> <CopyableContact value={settings.phone} type="phone" textClassName="text-[#2d3748]" />
                                    </div>
                                )}
                                {settings.email && (
                                    <div className="font-['Nunito'] text-[14px] text-[#2d3748] flex items-center gap-1">
                                        <strong>E-Mail:</strong> <CopyableContact value={settings.email} type="email" textClassName="text-[#2d3748]" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#fef9c3] rounded-[16px] h-[300px] flex items-center justify-center border border-[#cbd5e1] overflow-hidden">
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
                <section className="py-16 bg-[#fef9c3]">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-['Nunito'] font-semibold text-[24px] md:text-[32px] text-[#1a202c] mb-4 text-center">
                            Folgen Sie uns
                        </h2>
                        <p className="font-['Nunito'] text-[16px] text-[#64748b] mb-8 text-center">
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

                        <div className="flex justify-center gap-4">
                            {instagramLink && (
                                <a
                                    href={instagramLink.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 bg-white px-6 py-3 rounded-[16px] border border-[#cbd5e1] hover:border-[#1a3a52] transition-colors"
                                >
                                    <Instagram size={20} className="text-[#1a3a52]" />
                                    <span className="font-['Nunito'] font-medium text-[14px] text-[#2d3748]">
                                        {instagramLink.label?.trim() || "Instagram"}
                                    </span>
                                </a>
                            )}
                            {facebookLink && (
                                <a
                                    href={facebookLink.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 bg-white px-6 py-3 rounded-[16px] border border-[#cbd5e1] hover:border-[#1a3a52] transition-colors"
                                >
                                    <Facebook size={20} className="text-[#1a3a52]" />
                                    <span className="font-['Nunito'] font-medium text-[14px] text-[#2d3748]">
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
