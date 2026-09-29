"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { validationError, type ActionResult } from "@/lib/admin/common";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const passwordField = z.string().superRefine((value, ctx) => {
  const problem = passwordProblem(value);
  if (problem) ctx.addIssue({ code: "custom", message: problem });
});

const newUserSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name.").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: passwordField,
  role: z.enum(["admin", "editor"]),
});

export async function createUser(input: z.input<typeof newUserSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = newUserSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).get();
  if (existing) return { ok: false, error: "A user with this email already exists.", fieldErrors: { email: "Already in use" } };

  await db.insert(users).values({
    name: data.name,
    email: data.email,
    role: data.role,
    passwordHash: await hashPassword(data.password),
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(id: number): Promise<ActionResult> {
  const me = await requireAdmin();
  if (id === me.id) return { ok: false, error: "You can't delete your own account." };
  const target = await db.select({ role: users.role }).from(users).where(eq(users.id, id)).get();
  if (!target) return { ok: true };
  if (target.role === "admin") {
    const admins = await db.select({ total: count() }).from(users).where(eq(users.role, "admin")).get();
    if ((admins?.total ?? 0) <= 1) return { ok: false, error: "You can't delete the last admin." };
  }
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function resetUserPassword(id: number, password: string): Promise<ActionResult> {
  await requireAdmin();
  const problem = passwordProblem(password);
  if (problem) return { ok: false, error: problem };
  const target = await db.select().from(users).where(eq(users.id, id)).get();
  if (!target) return { ok: false, error: "User not found." };
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password), sessionVersion: target.sessionVersion + 1 })
    .where(eq(users.id, id));
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
});

export async function updateProfile(input: z.input<typeof profileSchema>): Promise<ActionResult> {
  const me = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const clash = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, parsed.data.email), ne(users.id, me.id)))
    .get();
  if (clash) return { ok: false, error: "Another user already uses this email.", fieldErrors: { email: "Already in use" } };
  await db.update(users).set(parsed.data).where(eq(users.id, me.id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function changeOwnPassword(input: { current: string; next: string }): Promise<ActionResult> {
  const me = await requireUser();
  const user = await db.select().from(users).where(eq(users.id, me.id)).get();
  if (!user) return { ok: false, error: "User not found." };
  if (!(await verifyPassword(input.current, user.passwordHash))) {
    return { ok: false, error: "Your current password is incorrect.", fieldErrors: { current: "Incorrect password" } };
  }
  const problem = passwordProblem(input.next);
  if (problem) return { ok: false, error: problem, fieldErrors: { next: problem } };

  const sessionVersion = user.sessionVersion + 1;
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(input.next), sessionVersion })
    .where(eq(users.id, me.id));
  // Sign out other devices but keep this browser signed in.
  await createSession({ uid: user.id, role: user.role, ver: sessionVersion });
  return { ok: true };
}
