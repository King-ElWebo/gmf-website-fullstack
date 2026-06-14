import Image from "next/image";
import { Instagram, Facebook, Sparkles, PartyPopper, Truck, Heart } from "lucide-react";
import { DisplayArea } from "@/lib/display-area";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { CategoryCarousel } from "@/components/public/CategoryCarousel";
import { CopyableContact } from "@/components/public/CopyableContact";
import { listGlobalImages } from "@/lib/repositories/global-images";
import { listCategories } from "@/lib/repositories/catalog";
import { getPublicSiteSettings } from "@/lib/repositories/site-settings";
import { COMPANY_CONFIG } from "@/lib/company-config";

export const revalidate = 3600;

const optimizedHeroImages: Record<string, string> = {
    "/uploads/3bcb0a7c-9cfa-46f6-9fc3-b2833376125f.jpg":
        "/uploads/optimized/3bcb0a7c-9cfa-46f6-9fc3-b2833376125f.jpg",
    "/uploads/9f830a8c-2aa2-40b2-9150-a3fe4cf52636.jpg":
        "/uploads/optimized/9f830a8c-2aa2-40b2-9150-a3fe4cf52636.jpg",
    "/uploads/38e679f1-567c-45ba-95f4-15a7da35fd57.jpg":
        "/uploads/optimized/38e679f1-567c-45ba-95f4-15a7da35fd57.jpg",
};

export default async function HomePage() {
    const [carouselImages, socialImages, categories, settings] = await Promise.all([
        listGlobalImages({ area: DisplayArea.CAROUSEL, published: true }),
        listGlobalImages({ area: DisplayArea.SOCIAL, published: true }),
        listCategories(),
        getPublicSiteSettings(),
    ]);

    const heroCarouselImages = carouselImages.map((image) => ({
        url: optimizedHeroImages[image.url] ?? image.url,
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

    return (
        <div className="min-h-screen bg-[var(--gmf-surface-cream)]">
            <HeroCarousel
                images={heroCarouselImages}
                title={heroTitle}
                text={heroText}
                noticeText={settings.noticeText?.trim() || null}
            />

            {/* === Kategorie Carousel === */}
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

            {/* === Willkommenstext === Surface B: Cream Accent */}
            <section className="relative overflow-hidden pb-20 pt-14 sm:pb-28 sm:pt-20">
                <div className="absolute inset-0 bg-[var(--gmf-surface-cream-accent)]" />

                <div className="relative max-w-[850px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#f13c20] to-[#ff7a3d] text-white px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold uppercase tracking-widest mb-6 shadow-md shadow-red-500/20">
                        <Sparkles size={14} />
                        Willkommen bei GMF Eventmodule
                        <Sparkles size={14} />
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(2rem,7vw,3rem)] text-[#1a3a52] mb-8 leading-tight">
                        Ihr Verleih für{" "}
                        <span className="bg-gradient-to-r from-[#f13c20] via-[#ff7a3d] to-[#fcd01b] bg-clip-text text-transparent">
                            Eventmodule
                        </span>
                    </h2>
                    <div className="space-y-5">
                        <p className="font-['Nunito'] text-[17px] sm:text-[19px] text-[#2d3748] leading-relaxed font-medium">
                            Planen Sie eine unvergessliche <strong>Hochzeit</strong>, einen aufregenden <strong>Kindergeburtstag</strong> oder ein professionelles <strong>Outdoor Event</strong>?
                        </p>
                        <p className="font-['Nunito'] text-[15px] sm:text-[17px] text-[#4a5568] leading-[1.8] max-w-[780px] mx-auto">
                            Bei uns können Sie hochwertige <strong className="text-[#1a3a52]">Eventmodule mieten</strong> – flexibel buchbar und perfekt für jede Art von privaten Feiern oder Sommerfesten.
                            Egal ob Sie eine bunte <strong className="text-[#1a3a52]">Hüpfburg mieten</strong> möchten für strahlende Kinderaugen, eine romantische <strong className="text-[#1a3a52]">Candybar</strong> für Ihre Hochzeit ausstatten wollen oder professionelle <strong className="text-[#1a3a52]">Licht- &amp; Tontechnik mieten</strong>.
                        </p>
                        <p className="font-['Nunito'] text-[15px] sm:text-[17px] text-[#4a5568] leading-[1.8] max-w-[780px] mx-auto">
                            Wir sind Ihr Ansprechpartner für <strong className="text-[#1a3a52]">Party Soundanlagen</strong>, Rutschen, Kinderspiele und Eventtechnik in der Region. Vertrauen Sie auf unseren Eventservice mit Abholung oder bequemer Lieferung direkt zu Ihrer <strong className="text-[#1a3a52]">Feier in Niederösterreich</strong>.
                        </p>
                    </div>
                </div>
            </section>

            {/* === So funktioniert's === Surface C: Blue Accent */}
            <section className="relative py-16 sm:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--gmf-surface-blue-light)] to-[var(--gmf-surface-blue-light-end)]" />

                <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-14">
                        <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full text-[13px] font-bold uppercase tracking-widest text-[#f13c20] border border-orange-100 shadow-sm mb-6">
                            <PartyPopper size={16} />
                            In 3 einfachen Schritten
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(1.8rem,6vw,2.8rem)] text-[#1a3a52]">
                            So funktioniert&apos;s! 🎈
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Step 1 */}
                        <div className="bg-white rounded-[28px] p-7 sm:p-8 text-center shadow-lg shadow-blue-500/5 border border-white/80 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative group">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-[#f13c20] to-[#ff7a3d] rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:rotate-6 transition-transform">
                                <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[22px] text-white">1</span>
                            </div>
                            <div className="text-3xl mb-3 mt-4">🎪</div>
                            <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[18px] sm:text-[20px] text-[#1a3a52] mb-3">
                                Eventausstattung wählen
                            </h3>
                            <p className="font-['Nunito'] text-[14px] text-[#64748b] leading-[1.6]">
                                Ob Hüpfburg für Kinder, Partyzubehör oder Eventtechnik – wählen Sie passendes Zubehör für Ihre Feier aus unserem Sortiment.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-[28px] p-7 sm:p-8 text-center shadow-lg shadow-blue-500/5 border border-white/80 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative group mt-6 md:mt-0">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-[#fcd01b] to-[#ff7a3d] rounded-2xl -rotate-3 flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:-rotate-6 transition-transform">
                                <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[22px] text-[#332600]">2</span>
                            </div>
                            <div className="text-3xl mb-3 mt-4">📋</div>
                            <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[18px] sm:text-[20px] text-[#1a3a52] mb-3">
                                Unverbindliche Anfrage
                            </h3>
                            <p className="font-['Nunito'] text-[14px] text-[#64748b] leading-[1.6]">
                                Senden Sie uns unverbindlich Ihre Wunschliste für Ihre geplante Feier, das Sommerfest oder den Kindergeburtstag.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-[28px] p-7 sm:p-8 text-center shadow-lg shadow-blue-500/5 border border-white/80 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative group mt-6 md:mt-0">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-[#066bb7] to-[#1a3a52] rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-transform">
                                <span style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[22px] text-white">3</span>
                            </div>
                            <div className="text-3xl mb-3 mt-4">🚚</div>
                            <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[18px] sm:text-[20px] text-[#1a3a52] mb-3">
                                Lieferung &amp; Service
                            </h3>
                            <p className="font-['Nunito'] text-[14px] text-[#64748b] leading-[1.6]">
                                Wir besprechen individuell, ob für die gewählten Produkte eine Lieferung samt Aufbau oder Selbstabholung in Frage kommt.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* === Standort & Abholung === Surface A: Cream Base */}
            <section className="relative py-16 sm:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[var(--gmf-surface-cream)]" />
                <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-14">
                        <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full text-[13px] font-bold uppercase tracking-widest text-[#066bb7] border border-blue-100 shadow-sm mb-6">
                            <Truck size={16} />
                            Lieferung &amp; Abholung
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(1.8rem,6vw,2.8rem)] text-[#1a3a52]">
                            📍 Standort &amp; Service
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-stretch">
                        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[28px] border border-yellow-100 shadow-xl shadow-yellow-500/5 flex flex-col">
                            <div className="flex-1">
                                <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[#4a5568] leading-[1.7] mb-6">
                                    Selbstabholung ist nach Vereinbarung nur bei dafür geeigneten Produkten (z.B. Kleinmaterial oder Technik) möglich. Hüpfburgen werden in der Regel direkt durch uns angeliefert. Die Liefer- und Anfahrtskosten werden individuell anhand der Entfernung berechnet.
                                </p>
                            </div>
                            <div className="space-y-3 bg-[var(--gmf-surface-cream-accent)] rounded-2xl p-5 border border-yellow-100">
                                <p className="font-['Nunito'] text-[14px] text-[#2d3748]">
                                    <strong>📍 Adresse:</strong> {settings.address?.trim() || COMPANY_CONFIG.address}
                                </p>
                                <p className="font-['Nunito'] text-[14px] text-[#2d3748]">
                                    <strong>🕐 Öffnungszeiten:</strong> {settings.openingHours?.trim() || "nach telefonischer Vereinbarung"}
                                </p>
                                {settings.phone && (
                                    <div className="font-['Nunito'] text-[14px] text-[#2d3748] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                        <strong>📞 Telefon:</strong> <CopyableContact value={settings.phone} type="phone" textClassName="text-[#2d3748]" />
                                    </div>
                                )}
                                {settings.email && (
                                    <div className="font-['Nunito'] text-[14px] text-[#2d3748] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                        <strong>✉️ E-Mail:</strong> <CopyableContact value={settings.email} type="email" textClassName="text-[#2d3748]" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[28px] h-[280px] sm:h-[340px] lg:h-auto flex items-center justify-center border border-blue-100 overflow-hidden shadow-xl shadow-blue-500/5">
                            <iframe
                                title="Google Maps Karte zum Standort GMF Eventmodule"
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

            {/* === Impressionen === Surface D: Brand Dark (Footer-adjacent) */}
            {(socialPreviewImages.length > 0 || socialLinks.length > 0) && (
                <section className="relative py-16 sm:py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--gmf-surface-dark)] to-[var(--gmf-surface-dark-deep)]" />
                    <div className="absolute inset-0 gmf-dots-pattern-light pointer-events-none" />

                    <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10 sm:mb-14">
                            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full text-[13px] font-bold uppercase tracking-widest text-[var(--gmf-surface-dark-highlight)] border border-white/10 shadow-sm mb-6">
                                <Heart size={16} />
                                Einblicke
                            </span>
                            <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="text-[clamp(1.8rem,6vw,2.8rem)] text-[var(--gmf-surface-dark-heading)]">
                                📸 Impressionen unserer Eventmodule
                            </h2>
                            <p className="font-['Nunito'] text-[15px] sm:text-[16px] text-[var(--gmf-surface-dark-muted)] mt-3 max-w-[600px] mx-auto">
                                Einblicke in unser Sortiment und Inspirationen für Ihre nächste Feier.
                            </p>
                        </div>

                        {socialPreviewImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-10">
                                {socialPreviewImages.map((image, idx) => (
                                    <div
                                        key={image.id}
                                        className="relative rounded-[20px] aspect-square border-2 border-white/10 shadow-lg shadow-black/20 overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:border-[var(--gmf-surface-dark-highlight)]/30 transition-all duration-300"
                                        style={{ transform: `rotate(${idx % 2 === 0 ? -1 : 1}deg)` }}
                                    >
                                        <Image
                                            src={image.url}
                                            alt={image.alt ?? "Impressionen von GMF Eventmodule"}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {(instagramLink || facebookLink) && (
                            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                                {instagramLink && (
                                    <a
                                        href={instagramLink.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex min-h-12 items-center gap-2.5 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full shadow-md shadow-black/10 border border-white/10 hover:-translate-y-1 hover:shadow-lg hover:bg-white/15 hover:border-[var(--gmf-surface-dark-highlight)]/30 transition-all duration-200"
                                    >
                                        <Instagram size={20} className="text-[#f66fae]" />
                                        <span className="font-['Nunito'] font-bold text-[15px] text-white">
                                            {instagramLink.label?.trim() || "Instagram"}
                                        </span>
                                    </a>
                                )}
                                {facebookLink && (
                                    <a
                                        href={facebookLink.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex min-h-12 items-center gap-2.5 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full shadow-md shadow-black/10 border border-white/10 hover:-translate-y-1 hover:shadow-lg hover:bg-white/15 hover:border-[var(--gmf-surface-dark-highlight)]/30 transition-all duration-200"
                                    >
                                        <Facebook size={20} className="text-[#66b3ff]" />
                                        <span className="font-['Nunito'] font-bold text-[15px] text-white">
                                            {facebookLink.label?.trim() || "Facebook"}
                                        </span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
