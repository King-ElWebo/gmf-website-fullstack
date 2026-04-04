import { getSiteSettings } from "@/lib/repositories/site-settings";
import SiteSettingsForm from "./_components/site-settings-form";

export default async function SiteSettingsPage() {
    const settings = await getSiteSettings();

    return (
        <SiteSettingsForm
            initial={{
                phone: settings.phone,
                email: settings.email,
                address: settings.address,
                openingHours: settings.openingHours,
                noticeText: settings.noticeText,
                heroTitle: settings.heroTitle,
                heroText: settings.heroText,
                additionalInfo: settings.additionalInfo,
                socialLinks: settings.socialLinks.map((link) => ({
                    id: link.id,
                    platform: link.platform,
                    label: link.label ?? "",
                    url: link.url,
                    isActive: link.isActive,
                })),
            }}
        />
    );
}
