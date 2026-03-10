import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET");
  return new TextEncoder().encode(secret);
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export async function signAdminToken() {
  // 7 Tage gültig
  const expSeconds = 60 * 60 * 24 * 7;

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expSeconds}s`)
    .sign(getSecret());
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload?.role === "admin";
}