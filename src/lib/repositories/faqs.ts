import { db } from "@/lib/db";

export async function listFaqs() {
    return (db as any).faq?.findMany({
        orderBy: { sortOrder: "asc" },
    }) ?? [];
}

export async function getFaqById(id: string) {
    return (db as any).faq?.findUnique({
        where: { id },
    }) ?? null;
}

export async function createFaq(data: {
    question: string;
    answer: string;
    published?: boolean;
    sortOrder?: number;
}) {
    return db.faq.create({ data });
}

export async function updateFaq(
    id: string,
    data: {
        question?: string;
        answer?: string;
        published?: boolean;
        sortOrder?: number;
    }
) {
    return db.faq.update({
        where: { id },
        data,
    });
}

export async function deleteFaq(id: string) {
    return db.faq.delete({
        where: { id },
    });
}

