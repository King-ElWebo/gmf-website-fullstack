import Link from "next/link";
import { listItems } from "@/lib/repositories/items";

export default async function AdminItemsPage() {
    const items = await listItems();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Items</h1>
                <Link className="rounded-md bg-white text-black hover:transform hover:translate-y-[-2px] px-3 py-2 text-sm" href="/admin/items/new">
                    New Item
                </Link>
            </div>

            <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="text-left">
                        <tr>
                            <th className="p-3">Title</th>
                            <th className="p-3">Slug</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-3">{item.title}</td>
                                <td className="p-3 text-neutral-600">{item.slug}</td>
                                <td className="p-3">{item.category?.name || "None"}</td>
                                <td className="p-3">
                                    {item.priceCents != null
                                        ? `$${(item.priceCents / 100).toFixed(2)}`
                                        : "-"}
                                </td>
                                <td className="p-3">
                                    {item.published ? (
                                        <span className="text-green-600">Published</span>
                                    ) : (
                                        <span className="text-yellow-600">Draft</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    <Link className="underline" href={`/admin/items/${item.id}/edit`}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td className="p-3 text-neutral-600" colSpan={6}>
                                    No items yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}