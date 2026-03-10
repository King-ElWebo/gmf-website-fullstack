import { db } from "@/lib/db";

export type ItemInput = {
    title: string;
    slug: string;
    description?: string | null;
    priceCents?: number | null;
    published: boolean;
    categoryId: string;
};

export async function listItems() {
    return db.item.findMany({
        orderBy: { createdAt: "desc" },
        include: { category: true },
    });
}

export async function getItemById(id: string) {
    if (!id) return null;
    return db.item.findUnique({
        where: { id },
        include: { category: true },
    });
}

export async function createItem(data: ItemInput) {
    return db.item.create({ data });
}

export async function updateItem(id: string, data: ItemInput) {
    return db.item.update({ where: { id }, data });
}

export async function deleteItem(id: string) {
    return db.item.delete({ where: { id } });
}