import Link from "next/link";
import { listGlobalImages } from "@/lib/repositories/global-images";

export default async function GlobalImagesPage() {
    const images = await listGlobalImages();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Bilder</h1>
                <Link className="rounded-md bg-white text-black hover:transform hover:translate-y-[-2px] px-3 py-2 text-sm border border-neutral-200 shadow-sm" href="/admin/images/new">
                    Neues Bild
                </Link>
            </div>

            <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="text-left">
                        <tr>
                            <th className="p-3 w-32">Vorschau</th>
                            <th className="p-3">Bereich</th>
                            <th className="p-3">Alt-Text</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Sortierung</th>
                            <th className="p-3 w-32">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {images.map((image) => (
                            <tr key={image.id} className="border-t">
                                <td className="p-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={image.url} 
                                        alt={image.alt ?? ""} 
                                        className="w-16 h-16 object-cover rounded shadow-sm border"
                                    />
                                </td>
                                <td className="p-3 text-neutral-600 font-medium">
                                    {image.area}
                                </td>
                                <td className="p-3 text-neutral-600 max-w-xs truncate">
                                    {image.alt || "-"}
                                </td>
                                <td className="p-3">
                                    {image.published ? (
                                        <span className="text-green-600 font-medium">Online</span>
                                    ) : (
                                        <span className="text-neutral-500 font-medium">Offline</span>
                                    )}
                                </td>
                                <td className="p-3 text-neutral-600">
                                    {image.sortOrder}
                                </td>
                                <td className="p-3">
                                    <Link className="underline" href={`/admin/images/${image.id}/edit`}>
                                        Bearbeiten
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {images.length === 0 && (
                            <tr>
                                <td className="p-3 text-center text-neutral-500" colSpan={6}>
                                    Noch keine Bilder hochgeladen.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
