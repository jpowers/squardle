"use server";

import { redirect } from "next/navigation";
import { setAdminSession, clearAdminSession, verifyPassword } from "@/lib/auth";

export async function login(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  if (!verifyPassword(password)) {
    return { error: "Invalid password" };
  }

  await setAdminSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
