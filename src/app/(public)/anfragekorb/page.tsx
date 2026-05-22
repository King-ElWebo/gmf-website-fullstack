import { InquiryCartPageClient } from "@/components/public/InquiryCartPageClient";
import { getPublicSiteSettings } from "@/lib/repositories/site-settings";

export default async function InquiryCartPage() {
    const settings = await getPublicSiteSettings();
    return <InquiryCartPageClient settings={settings} />;
}
