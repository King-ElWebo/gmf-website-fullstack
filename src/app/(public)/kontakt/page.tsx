import { getPublicSiteSettings } from "@/lib/repositories/site-settings";
import { ContactClient } from "./ContactClient";

export const revalidate = 3600; // Cache for 1 hour, or depending on how often settings change

export default async function ContactPage() {
    const settings = await getPublicSiteSettings();

    return <ContactClient settings={settings} />;
}