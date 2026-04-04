import { NextResponse } from "next/server";
import { getPublicSiteSettings } from "@/lib/repositories/site-settings";

export async function GET() {
    const settings = await getPublicSiteSettings();
    return NextResponse.json({ settings });
}
