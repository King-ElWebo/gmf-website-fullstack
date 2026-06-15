import { notFound } from "next/navigation";
import { getResourceById } from "@/lib/repositories/resources";
import ResourceForm from "../../_components/resource-form";

export default async function EditResourcePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    if (!id || typeof id !== "string") return notFound();

    const resource = await getResourceById(id);
    if (!resource) return notFound();

    return (
        <ResourceForm
            mode="edit"
            resourceId={resource.id}
            initial={{
                name: resource.name,
                capacityPerDay: resource.capacityPerDay,
                isActive: resource.isActive,
            }}
        />
    );
}
