"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string; email?: string };

let dummyHash: string | null = null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const limiterKey = `login:${clientIp(await headers())}`;
  if (!rateLimit(limiterKey, 8, 15 * 60 * 1000).ok) {
    return { error: "Too many login attempts. Please wait 15 minutes and try again.", email };
  }
  if (!email || !password) return { error: "Enter your email and password.", email };

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  // Always run bcrypt so response time doesn't reveal whether the email exists.
  dummyHash ??= bcrypt.hashSync("not-a-real-password", 10);
  const valid = await verifyPassword(password, user?.passwordHash ?? dummyHash);
  if (!user || !valid) return { error: "Incorrect email or password.", email };

  resetRateLimit(limiterKey);
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession({ uid: user.id, role: user.role, ver: user.sessionVersion });
  redirect(next.startsWith("/admin/") && !next.startsWith("/admin/login") ? next : "/admin/");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login/");
}
