import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { ScrollToTop } from '@/components/public/ScrollToTop';
import { getPublicSiteSettings } from '@/lib/repositories/site-settings';
import './public-globals.css';
import '@/styles/public-animations.css';

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getPublicSiteSettings();

    return (
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
            />
        </div>
    );
}
