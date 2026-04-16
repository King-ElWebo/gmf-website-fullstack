import { db } from "@/lib/db";

export async function listFaqs(): Promise<any[]> {
    return [];
}

export async function getFaqById(id: string): Promise<any> {
    return null;
}

export async function createFaq(data: {
    question: string;
    answer: string;
    published?: boolean;
}) {
    return { id: "mock-faq", sortOrder: 0, question: data.question, answer: data.answer, published: data.published ?? false, createdAt: new Date(), updatedAt: new Date() } as any;
}

export async function updateFaq(
    id: string,
    data: {
        question?: string;
        answer?: string;
        published?: boolean;
    }
) {
    return { id, ...data };
}

export async function deleteFaq(id: string) {
    return { id };
}

export async function reorderFaqs(orderedIds: string[]): Promise<any[]> {
    return [];
}

export async function normalizeFaqSortOrder() {
    return;
}
