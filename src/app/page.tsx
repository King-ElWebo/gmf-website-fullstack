import { listCategories } from "@/lib/repositories/catalog";

export default async function Home() {
  const categories = await listCategories();

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Option 3 Starter</h1>
      <p className="text-sm text-neutral-600">DB läuft? Dann siehst du hier Kategorien aus Postgres.</p>

      <ul className="list-disc pl-6">
        {categories.map((c) => (
          <li key={c.id}>
            {c.name} <span className="text-neutral-500">({c.slug})</span>
          </li>
        ))}
      </ul>
    </main>
  );
}