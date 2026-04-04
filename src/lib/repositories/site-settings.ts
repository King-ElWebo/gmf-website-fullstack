import { db } from "@/lib/db";

export type SiteSocialLinkRecord = {
    id: string;
    settingsId: string;
    platform: string;
    label: string | null;
    url: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type SiteSettingsRecord = {
    id: string;
    key: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    openingHours: string | null;
    noticeText: string | null;
    heroTitle: string | null;
    heroText: string | null;
    additionalInfo: string | null;
    createdAt: Date;
    updatedAt: Date;
    socialLinks: SiteSocialLinkRecord[];
};

export type SiteSocialLinkInput = {
    platform: string;
    label?: string | null;
    url: string;
    isActive?: boolean;
};

export type SiteSettingsInput = {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    openingHours?: string | null;
    noticeText?: string | null;
    heroTitle?: string | null;
    heroText?: string | null;
    additionalInfo?: string | null;
    socialLinks?: SiteSocialLinkInput[];
};

const settingsInclude = {
    socialLinks: {
        orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
    },
};

export async function getSiteSettings(): Promise<SiteSettingsRecord> {
    const existing = await db.siteSettings.findUnique({
        where: { key: "default" },
        include: settingsInclude,
    });

    if (existing) return existing as SiteSettingsRecord;

    return (await db.siteSettings.create({
        data: { key: "default" },
        include: settingsInclude,
    })) as SiteSettingsRecord;
}

export async function getPublicSiteSettings(): Promise<SiteSettingsRecord> {
    const settings = await getSiteSettings();

    return {
        ...settings,
        socialLinks: settings.socialLinks.filter((link) => link.isActive),
    };
}

export async function updateSiteSettings(input: SiteSettingsInput) {
    const existing = await getSiteSettings();

    const socialLinks = (input.socialLinks ?? [])
        .map((link) => ({
            platform: link.platform.trim(),
            label: link.label?.trim() || null,
            url: link.url.trim(),
            isActive: link.isActive ?? true,
        }))
        .filter((link) => link.platform.length > 0 && link.url.length > 0);

    await db.$transaction(async (tx) => {
        await tx.siteSettings.update({
            where: { id: existing.id },
            data: {
                phone: input.phone ?? null,
                email: input.email ?? null,
                address: input.address ?? null,
                openingHours: input.openingHours ?? null,
                noticeText: input.noticeText ?? null,
                heroTitle: input.heroTitle ?? null,
                heroText: input.heroText ?? null,
                additionalInfo: input.additionalInfo ?? null,
            },
        });

        await tx.siteSocialLink.deleteMany({
            where: { settingsId: existing.id },
        });

        if (socialLinks.length > 0) {
            await tx.siteSocialLink.createMany({
                data: socialLinks.map((link, index) => ({
                    settingsId: existing.id,
                    platform: link.platform,
                    label: link.label,
                    url: link.url,
                    isActive: link.isActive,
                    sortOrder: index,
                })),
            });
        }
    });

    return getSiteSettings();
}
