import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { CopyableContact } from "@/components/public/CopyableContact";

type FooterLink = {
    id: string;
    platform: string;
    label: string | null;
    url: string;
};

type NavLink = {
    href: string;
    label: string;
};

type LegalLink = {
    href: string;
    label: string;
};

type FooterProps = {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    socialLinks?: FooterLink[];
    navLinks?: NavLink[];
    legalLinks?: LegalLink[];
};

function renderSocialIcon(platform: string) {
    const normalized = platform.toLowerCase();

    if (normalized === "instagram") return <Instagram size={20} />;
    if (normalized === "facebook") return <Facebook size={20} />;

    return null;
}

export function Footer({
    phone,
    email,
    address,
    socialLinks = [],
    navLinks = [],
    legalLinks = [],
}: FooterProps) {
    const links: NavLink[] = navLinks.length > 0
        ? navLinks
        : [
              { href: "/", label: "Startseite" },
              { href: "/produkte", label: "Produkte" },
              { href: "/faq", label: "FAQ" },
              { href: "/kontakt", label: "Kontakt" },
          ];

    const legal: LegalLink[] = legalLinks.length > 0
        ? legalLinks
        : [
              { href: "/impressum", label: "Impressum" },
              { href: "/datenschutz", label: "Datenschutz" },
              { href: "/agb", label: "AGB" },
              { href: "/widerruf", label: "Widerruf" },
          ];

    return (
        <footer className="mt-auto bg-gradient-to-b from-[#1a3a52] to-[#0f2535] text-white">
            <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
                <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-2 md:text-left lg:grid-cols-4">
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="mb-4 text-[20px] text-[#fcd01b]">🎪 GMF Eventmodule</h3>
                        <p className="font-['Nunito'] text-[14px] leading-[22px] text-[#c8d8e8]">
                            Ihre Experten für Hüpfburgen, Eventmodule und Eventtechnik in Niederösterreich.
                        </p>
                    </div>

                    <div>
                        <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="mb-4 text-[20px] text-[#fcd01b]">🧭 Navigation</h3>
                        <nav className="flex flex-col items-center gap-2.5 md:items-start">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="font-['Nunito'] text-[14px] text-[#c8d8e8] transition-colors hover:text-[#fcd01b] hover:translate-x-1 transition-all duration-200"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="mb-4 text-[20px] text-[#fcd01b]">📜 Rechtliches</h3>
                        <nav className="flex flex-col items-center gap-2.5 md:items-start">
                            {legal.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="font-['Nunito'] text-[14px] text-[#c8d8e8] transition-colors hover:text-[#fcd01b] hover:translate-x-1 transition-all duration-200"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 style={{ fontFamily: 'var(--font-fredoka), sans-serif' }} className="mb-4 text-[20px] text-[#fcd01b]">📞 Kontakt</h3>
                        <div className="mb-5 space-y-2 font-['Nunito'] text-[14px] leading-[22px] text-[#c8d8e8]">
                            {address && <p className="whitespace-pre-line break-words">{address}</p>}
                            {email && (
                                <div className="flex items-center justify-center gap-1 break-all md:justify-start">
                                    <span>✉️</span>
                                    <CopyableContact value={email} type="email" textClassName="text-[#c8d8e8] hover:text-[#fcd01b]" />
                                </div>
                            )}
                            {phone && (
                                <div className="flex items-center justify-center gap-1 md:justify-start">
                                    <span>📞</span>
                                    <CopyableContact value={phone} type="phone" textClassName="text-[#c8d8e8] hover:text-[#fcd01b]" />
                                </div>
                            )}
                        </div>
                        {socialLinks.length > 0 && (
                            <div className="flex justify-center gap-3 md:justify-start">
                                {socialLinks.map((link) => {
                                    const icon = renderSocialIcon(link.platform);
                                    if (!icon) return null;

                                    return (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={link.label?.trim() || link.platform}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-gradient-to-br hover:from-[#fcd01b] hover:to-[#ff7a3d] hover:text-[#1a3a52] hover:-translate-y-1 hover:scale-110 shadow-md"
                                        >
                                            {icon}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-8 text-center">
                    <p className="font-['Nunito'] text-[13px] text-[#8ba4bc]">
                        &copy; 2026 GMF Eventmodule. Alle Rechte vorbehalten. 🎉
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                        {legal.map((link) => (
                            <Link
                                key={`bottom-${link.href}`}
                                href={link.href}
                                className="font-['Nunito'] text-[12px] text-[#6d8fa8] transition-colors hover:text-[#fcd01b]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
