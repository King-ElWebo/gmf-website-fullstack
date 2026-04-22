import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';
import { CopyableContact } from '@/components/public/CopyableContact';

type FooterLink = {
    platform: string;
    label: string | null;
    url: string;
};

type NavLink = {
    href: string;
    label: string;
};

type FooterProps = {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    socialLinks?: FooterLink[];
    navLinks?: NavLink[];
};

function renderSocialIcon(platform: string) {
    const normalized = platform.toLowerCase();

    if (normalized === 'instagram') return <Instagram size={20} />;
    if (normalized === 'facebook') return <Facebook size={20} />;

    return null;
}

export function Footer({ phone, email, address, socialLinks = [], navLinks = [] }: FooterProps) {
    // Fallback nav links if none provided
    const links: NavLink[] = navLinks.length > 0 ? navLinks : [
        { href: '/', label: 'Startseite' },
        { href: '/produkte', label: 'Produkte' },
        { href: '/faq', label: 'FAQ' },
        { href: '/kontakt', label: 'Kontakt' },
    ];

    return (
        <footer className="bg-[#2d3748] text-white mt-auto">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div>
                        <h3 className="font-['Nunito'] font-semibold text-[18px] mb-4">Event-Vermietung</h3>
                        <p className="font-['Nunito'] text-[14px] text-[#e2e8f0] leading-[20px]">
                            Ihre Experten für Hüpfburgen und Eventmodule
                        </p>
                    </div>

                    <div>
                        <h3 className="font-['Nunito'] font-semibold text-[18px] mb-4">Navigation</h3>
                        <nav className="flex flex-col gap-2 items-center md:items-start">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="font-['Nunito'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="font-['Nunito'] font-semibold text-[18px] mb-4">Kontakt</h3>
                        <div className="font-['Nunito'] text-[14px] text-[#e2e8f0] leading-[20px] mb-4 space-y-1">
                            {address && <p className="whitespace-pre-line break-words">{address}</p>}
                            {email && (
                                <div className="flex items-center justify-center md:justify-start gap-1 break-all">
                                    <span>Mail:</span> <CopyableContact value={email} type="email" textClassName="text-[#e2e8f0] hover:text-[#93c5fd]" />
                                </div>
                            )}
                            {phone && (
                                <div className="flex items-center justify-center md:justify-start gap-1">
                                    <span>Tel:</span> <CopyableContact value={phone} type="phone" textClassName="text-[#e2e8f0] hover:text-[#93c5fd]" />
                                </div>
                            )}
                        </div>
                        {socialLinks.length > 0 && (
                            <div className="flex gap-4 justify-center md:justify-start">
                                {socialLinks.map((link) => {
                                    const icon = renderSocialIcon(link.platform);
                                    if (!icon) return null;

                                    return (
                                        <a
                                            key={`${link.platform}-${link.url}`}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={link.label?.trim() || link.platform}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#64748b] text-[#e2e8f0] hover:text-white hover:border-white transition-colors"
                                        >
                                            {icon}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-[#64748b] mt-7 sm:mt-8 pt-7 sm:pt-8 text-center">
                    <p className="font-['Nunito'] text-[12px] text-[#e2e8f0]">
                        © 2026 Event-Vermietung. Alle Rechte vorbehalten.
                    </p>
                </div>
            </div>
        </footer>
    );
}
