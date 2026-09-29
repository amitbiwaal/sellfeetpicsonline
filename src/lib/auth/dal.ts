import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { readSession } from "./session";

export type CurrentUser = { id: number; name: string; email: string; role: "admin" | "editor" };

/** The signed-in admin user, verified against the database (or null). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;
  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      sessionVersion: users.sessionVersion,
    })
    .from(users)
    .where(eq(users.id, session.uid))
    .get();
  if (!user || user.sessionVersion !== session.ver) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
});

/** Use in admin pages and every server action. Redirects to the login page when signed out. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login/");
  return user;
}

/** Only full admins (not editors) can manage users and site settings. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/admin/?denied=1");
  return user;
}
