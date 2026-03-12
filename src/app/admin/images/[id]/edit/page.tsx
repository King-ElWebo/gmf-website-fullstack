import { notFound } from "next/navigation";
import { getGlobalImageById } from "@/lib/repositories/global-images";
import ImageForm from "../../_components/image-form";

export default async function EditGlobalImagePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    
    if (!id || typeof id !== "string") return notFound();

    const image = await getGlobalImageById(id);
    if (!image) return notFound();

    return <ImageForm mode="edit" initialData={image} />;
}
