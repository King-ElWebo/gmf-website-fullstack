"use client";

import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#2d3748] text-white mt-auto">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="font-['Inter'] font-semibold text-[18px] mb-4">Event-Vermietung</h3>
                        <p className="font-['Inter'] text-[14px] text-[#e2e8f0] leading-[20px]">
                            Ihre Experten für Hüpfburgen und Eventmodule
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-['Inter'] font-semibold text-[18px] mb-4">Navigation</h3>
                        <nav className="flex flex-col gap-2">
                            <Link href="/" className="font-['Inter'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors">
                                Startseite
                            </Link>
                            <Link href="/produkte" className="font-['Inter'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors">
                                Produkte
                            </Link>
                            <Link href="/faq" className="font-['Inter'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors">
                                FAQ
                            </Link>
                            <Link href="/kontakt" className="font-['Inter'] text-[14px] text-[#e2e8f0] hover:text-white transition-colors">
                                Kontakt
                            </Link>
                        </nav>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-['Inter'] font-semibold text-[18px] mb-4">Kontakt</h3>
                        <p className="font-['Inter'] text-[14px] text-[#e2e8f0] leading-[20px] mb-4">
                            Spargelfeldgasse 22 (fehlt noch)<br />
                            3702 Stranzendorf<br />
                            Mail: gmfeventmodule@gmail.com<br />
                            Tel: 0664 5550324
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-[#e2e8f0] hover:text-white transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-[#e2e8f0] hover:text-white transition-colors">
                                <Facebook size={20} />
                            </a>
                        </div>
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
