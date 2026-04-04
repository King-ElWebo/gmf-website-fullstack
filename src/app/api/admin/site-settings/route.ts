import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings } from "@/lib/repositories/site-settings";

type SiteSettingsRequestBody = {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    openingHours?: string | null;
    noticeText?: string | null;
    heroTitle?: string | null;
    heroText?: string | null;
    additionalInfo?: string | null;
    socialLinks?: Array<{
        platform?: string | null;
        label?: string | null;
        url?: string | null;
        isActive?: boolean;
    }>;
};

export async function GET() {
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
    try {
        const body = (await req.json().catch(() => null)) as SiteSettingsRequestBody | null;

        const settings = await updateSiteSettings({
            phone: body?.phone?.trim() || null,
            email: body?.email?.trim() || null,
            address: body?.address?.trim() || null,
            openingHours: body?.openingHours?.trim() || null,
            noticeText: body?.noticeText?.trim() || null,
            heroTitle: body?.heroTitle?.trim() || null,
            heroText: body?.heroText?.trim() || null,
            additionalInfo: body?.additionalInfo?.trim() || null,
            socialLinks: (body?.socialLinks ?? []).map((link) => ({
                platform: link.platform?.trim() || "",
                label: link.label?.trim() || null,
                url: link.url?.trim() || "",
                isActive: Boolean(link.isActive ?? true),
            })),
        });

        return NextResponse.json({ settings });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Update failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
