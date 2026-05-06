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
        <footer className="mt-auto bg-[#2d3748] text-white">
            <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-2 md:text-left lg:grid-cols-4">
                    <div>
                        <h3 className="mb-4 font-['Nunito'] text-[18px] font-semibold">Event-Vermietung</h3>
                        <p className="font-['Nunito'] text-[14px] leading-[20px] text-[#e2e8f0]">
                            Ihre Experten fuer Huepfburgen und Eventmodule
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 font-['Nunito'] text-[18px] font-semibold">Navigation</h3>
                        <nav className="flex flex-col items-center gap-2 md:items-start">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="font-['Nunito'] text-[14px] text-[#e2e8f0] transition-colors hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="mb-4 font-['Nunito'] text-[18px] font-semibold">Rechtliches</h3>
                        <nav className="flex flex-col items-center gap-2 md:items-start">
                            {legal.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="font-['Nunito'] text-[14px] text-[#e2e8f0] transition-colors hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="mb-4 font-['Nunito'] text-[18px] font-semibold">Kontakt</h3>
                        <div className="mb-4 space-y-1 font-['Nunito'] text-[14px] leading-[20px] text-[#e2e8f0]">
                            {address && <p className="whitespace-pre-line break-words">{address}</p>}
                            {email && (
                                <div className="flex items-center justify-center gap-1 break-all md:justify-start">
                                    <span>Mail:</span>
                                    <CopyableContact value={email} type="email" textClassName="text-[#e2e8f0] hover:text-[#93c5fd]" />
                                </div>
                            )}
                            {phone && (
                                <div className="flex items-center justify-center gap-1 md:justify-start">
                                    <span>Tel:</span>
                                    <CopyableContact value={phone} type="phone" textClassName="text-[#e2e8f0] hover:text-[#93c5fd]" />
                                </div>
                            )}
                        </div>
                        {socialLinks.length > 0 && (
                            <div className="flex justify-center gap-4 md:justify-start">
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
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#64748b] text-[#e2e8f0] transition-colors hover:border-white hover:text-white"
                                        >
                                            {icon}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-7 border-t border-[#64748b] pt-7 text-center sm:mt-8 sm:pt-8">
                    <p className="font-['Nunito'] text-[12px] text-[#e2e8f0]">
                        &copy; 2026 Event-Vermietung. Alle Rechte vorbehalten.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                        {legal.map((link) => (
                            <Link
                                key={`bottom-${link.href}`}
                                href={link.href}
                                className="font-['Nunito'] text-[12px] text-[#cbd5e1] transition-colors hover:text-white"
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
