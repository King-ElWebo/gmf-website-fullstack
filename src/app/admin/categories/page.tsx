import Link from "next/link";
import { listCategories } from "@/lib/repositories/categories";

export default async function AdminCategoriesPage() {
    const categories = await listCategories();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Categories</h1>
                <Link className="rounded-md bg-white text-black hover:transform hover:translate-y-[-2px] px-3 py-2 text-sm" href="/admin/categories/new">
                    New Category
                </Link>
            </div>

            <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="text-left">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Slug</th>
                            <th className="p-3 w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c) => (
                            <tr key={c.id} className="border-t">
                                <td className="p-3">{c.name}</td>
                                <td className="p-3 text-neutral-600">{c.slug}</td>
                                <td className="p-3">
                                    <Link className="underline" href={`/admin/categories/${c.id}/edit`}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td className="p-3 text-neutral-600" colSpan={3}>
                                    No categories yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}