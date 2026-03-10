import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/repositories/categories";
import EditCategoryForm from "./ui";

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    if (!id || typeof id !== "string") return notFound();

    const category = await getCategoryById(id);
    if (!category) return notFound();

    return <EditCategoryForm category={category} />;
}