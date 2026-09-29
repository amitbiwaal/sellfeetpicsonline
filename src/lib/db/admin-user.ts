import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { db } from "./index";
import { users } from "./schema";

/** Create an admin, or reset the password of an existing account. */
export async function upsertAdminUser(input: { email: string; password: string; name?: string }) {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  const existing = await db.select().from(users).where(eq(users.email, email)).get();

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, sessionVersion: existing.sessionVersion + 1 })
      .where(eq(users.id, existing.id));
    return { created: false, email };
  }

  await db.insert(users).values({
    email,
    name: input.name?.trim() || "Admin",
    passwordHash,
    role: "admin",
  });
  return { created: true, email };
}

export async function countUsers() {
  const rows = await db.select({ id: users.id }).from(users);
  return rows.length;
}
