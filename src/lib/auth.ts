import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_COOKIE_VALUE = "authenticated";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  return session?.value === ADMIN_COOKIE_VALUE;
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  return password === adminPassword;
}
