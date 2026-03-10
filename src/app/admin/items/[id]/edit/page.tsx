import { notFound } from "next/navigation";
import { listCategories } from "@/lib/repositories/categories";
import { getItemById } from "@/lib/repositories/items";
import { listByItemId } from "@/lib/repositories/item-images";
import ItemForm from "../../_components/item-form";

export default async function EditItemPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    if (!id || typeof id !== "string") return notFound();

    const [categories, item, images] = await Promise.all([
        listCategories(),
        getItemById(id),
        listByItemId(id),
    ]);
    if (!item) return notFound();

    return (
        <ItemForm
            mode="edit"
            itemId={item.id}
            categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
            initialImages={images}
            initial={{
                title: item.title,
                slug: item.slug,
                description: item.description ?? "",
                priceCents: item.priceCents?.toString() ?? "",
                published: item.published,
                categoryId: item.categoryId,
            }}
        />
    );
}