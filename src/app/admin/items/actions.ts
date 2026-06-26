"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleItemPublished(id: string, currentlyPublished: boolean) {
    try {
        await db.item.update({
            where: { id },
            data: { published: !currentlyPublished }
        });
        
        revalidatePath("/admin/items");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle published status:", error);
        return { success: false, error: "Status konnte nicht geändert werden" };
    }
}
