import { db } from "@/lib/db";

export type CategoryInput = {
    name: string;
    slug: string;
};

export async function listCategories() {
    return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryById(id: string) {
    return db.category.findUnique({ where: { id } });
}

export async function createCategory(data: CategoryInput) {
    return db.category.create({ data });
}

export async function updateCategory(id: string, data: CategoryInput) {
    return db.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
    return db.category.delete({ where: { id } });
}