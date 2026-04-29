import { db } from "@/lib/db";

export async function listFaqs() {
    return db.faq.findMany({
        orderBy: { sortOrder: "asc" },
    });
}

export async function getFaqById(id: string) {
    return db.faq.findUnique({
        where: { id },
    });
}

export async function createFaq(data: {
    question: string;
    answer: string;
    published?: boolean;
}) {
    const maxSort = await db.faq.aggregate({
        _max: { sortOrder: true },
    });
    const nextSortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    return db.faq.create({
        data: {
            ...data,
            sortOrder: nextSortOrder,
        },
    });
}

export async function updateFaq(
    id: string,
    data: {
        question?: string;
        answer?: string;
        published?: boolean;
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

export async function reorderFaqs(orderedIds: string[]) {
    const transaction = orderedIds.map((id, index) =>
        db.faq.update({
            where: { id },
            data: { sortOrder: index },
        })
    );
    return db.$transaction(transaction);
}

export async function normalizeFaqSortOrder() {
    const faqs = await db.faq.findMany({
        orderBy: { sortOrder: "asc" },
    });
    const transaction = faqs.map((faq, index) =>
        db.faq.update({
            where: { id: faq.id },
            data: { sortOrder: index },
        })
    );
    await db.$transaction(transaction);
}
