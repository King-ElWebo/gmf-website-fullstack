import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const redirectTo = url.searchParams.get("redirectTo") ?? "/admin/login";

  const res = NextResponse.redirect(new URL(redirectTo, url.origin), 303);

  // Cookie löschen
  res.cookies.set({
    name: getAdminCookieName(),
    value: "",
    path: "/",
    maxAge: 0,
  });

  return res;
}