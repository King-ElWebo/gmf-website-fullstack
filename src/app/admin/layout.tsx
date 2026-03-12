import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-5xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-semibold">
              Admin
            </Link>
            <nav className="text-sm text-neutral-700 flex gap-3">
              <Link href="/admin/categories">Categories</Link>
              <Link href="/admin/items">Items</Link>
              <Link href="/admin/faqs">FAQs</Link>
              <Link href="/admin/images">Bilder</Link>
            </nav>
          </div>

          <form action="/api/admin/logout?redirectTo=/admin/login" method="post">
            <button className="text-sm rounded-md border px-3 py-1">
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}