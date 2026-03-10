import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminToken } from "@/lib/admin-auth";

function isPublicPath(pathname: string) {
  return (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login"
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Nur Admin-Bereiche schützen
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Login-Seiten zulassen
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Cookie prüfen
  const token = req.cookies.get(getAdminCookieName())?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const ok = await verifyAdminToken(token);
    if (!ok) throw new Error("Invalid token");

    return NextResponse.next();
  } catch {
    // Cookie ungültig -> neu einloggen
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

// Matcher: nur admin & api/admin
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};