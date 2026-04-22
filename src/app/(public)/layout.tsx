import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { InquiryCartProvider } from '@/components/public/InquiryCartProvider';
import { ScrollToTop } from '@/components/public/ScrollToTop';
import { getPublicSiteSettings } from '@/lib/repositories/site-settings';
import { listNavCatalogTypes } from '@/lib/repositories/catalog-types';
import './public-globals.css';
import '@/styles/public-animations.css';

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [settings, navCatalogTypes] = await Promise.all([
        getPublicSiteSettings(),
        listNavCatalogTypes(),
    ]);

    // Build the same nav link structure for the Footer
    const footerNavLinks = [
        { href: '/', label: 'Startseite' },
        ...navCatalogTypes.map((ct) => ({
            href: ct.isDefault ? '/produkte' : `/katalog/${ct.slug}`,
            label: ct.navLabel?.trim() || ct.name,
        })),
        { href: '/faq', label: 'FAQ' },
        { href: '/kontakt', label: 'Kontakt' },
    ];

    return (
        <InquiryCartProvider>
            <div className="public-site flex flex-col min-h-screen">
                <ScrollToTop />
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer
                    phone={settings.phone}
                    email={settings.email}
                    address={settings.address}
                    socialLinks={settings.socialLinks}
                    navLinks={footerNavLinks}
                />
            </div>
        </InquiryCartProvider>
    );
}
