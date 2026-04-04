import { db } from "@/lib/db";

export async function listFaqs() {
    return db.faq.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
    const last = await db.faq.findFirst({
        orderBy: [{ sortOrder: "desc" }],
        select: { sortOrder: true },
    });

    return db.faq.create({
        data: {
            question: data.question,
            answer: data.answer,
            published: data.published,
            sortOrder: (last?.sortOrder ?? -1) + 1,
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
    const deleted = await db.faq.delete({
        where: { id },
    });

    await normalizeFaqSortOrder();
    return deleted;
}

export async function reorderFaqs(orderedIds: string[]) {
    const faqs = await db.faq.findMany({
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (faqs.length !== orderedIds.length) {
        throw new Error("orderedIds must include all FAQs");
    }

    const existingIds = new Set(faqs.map((faq) => faq.id));
    const uniqueIds = new Set(orderedIds);

    if (uniqueIds.size !== orderedIds.length || orderedIds.some((id) => !existingIds.has(id))) {
        throw new Error("orderedIds contains invalid FAQ IDs");
    }

    await db.$transaction(
        orderedIds.map((id, index) =>
            db.faq.update({
                where: { id },
                data: { sortOrder: index },
            })
        )
    );

    return listFaqs();
}

export async function normalizeFaqSortOrder() {
    const faqs = await db.faq.findMany({
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });

    await db.$transaction(
        faqs.map((faq, index) =>
            db.faq.update({
                where: { id: faq.id },
                data: { sortOrder: index },
            })
        )
    );
}
