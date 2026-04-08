import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';

type FooterLink = {
    platform: string;
    label: string | null;
    url: string;
};

type FooterProps = {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    socialLinks?: FooterLink[];
};

function renderSocialIcon(platform: string) {
    const normalized = platform.toLowerCase();

    if (normalized === 'instagram') return <Instagram size={20} />;
    if (normalized === 'facebook') return <Facebook size={20} />;

    return null;
}

export function Footer({ phone, email, address, socialLinks = [] }: FooterProps) {
    return (
        <footer className="bg-[#2d3748] text-white mt-auto">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-['Inter'] font-semibold text-[18px] mb-4">Event-Vermietung</h3>
                        <p className="font-['Inter'] text-[14px] text-[#e2e8f0] leading-[20px]">
                            Ihre Experten für Hüpfburgen und Eventmodule
                        </p>
                    </div>

                    <div>
                        <h3 className="font-['Inter'] font-semibold text-[18px] mb-4">Navigation</h3>
                        <nav className="flex flex-col gap-2">
                            <Link href="/" className="font-['Inter'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors">
                                Startseite
                            </Link>
                            <Link href="/produkte" className="font-['Inter'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors">
                                Produkte
                            </Link>
                            <Link href="/licht-tontechnik" className="font-['Inter'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors">
                                Licht & Ton
                            </Link>
                            <Link href="/faq" className="font-['Inter'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors">
                                FAQ
                            </Link>
                            <Link href="/kontakt" className="font-['Inter'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors">
                                Kontakt
                            </Link>
                        </nav>
                    </div>

                    <div>
                        <h3 className="font-['Inter'] font-semibold text-[18px] mb-4">Kontakt</h3>
                        <div className="font-['Inter'] text-[14px] text-[#e2e8f0] leading-[20px] mb-4 space-y-1">
                            {address && <p className="whitespace-pre-line">{address}</p>}
                            {email && <p>Mail: {email}</p>}
                            {phone && <p>Tel: {phone}</p>}
                        </div>
                        {socialLinks.length > 0 && (
                            <div className="flex gap-4">
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
                                            className="text-[#e2e8f0] hover:text-white transition-colors"
                                        >
                                            {icon}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-[#64748b] mt-8 pt-8 text-center">
                    <p className="font-['Inter'] text-[12px] text-[#e2e8f0]">
                        © 2026 Event-Vermietung. Alle Rechte vorbehalten.
                    </p>
                </div>
            </div>
        </footer>
    );
}
