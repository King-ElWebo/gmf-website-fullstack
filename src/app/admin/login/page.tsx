"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Login failed");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Admin Login</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bitte Admin-Passwort eingeben.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Passwort</label>
          <input
            type="password"
            className="w-full rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-[14px] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
          disabled={loading || !password}
        >
          {loading ? "Logging in..." : "Einloggen"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex h-[100dvh] w-full items-center justify-center overflow-auto bg-slate-50 p-4">
      <Suspense fallback={<div className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-500">Laden...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}