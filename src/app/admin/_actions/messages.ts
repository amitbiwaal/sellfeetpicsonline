"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/common";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

export async function setMessageRead(id: number, isRead: boolean): Promise<ActionResult> {
  await requireUser();
  await db.update(messages).set({ isRead }).where(eq(messages.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function markAllMessagesRead(): Promise<ActionResult> {
  await requireUser();
  await db.update(messages).set({ isRead: true }).where(eq(messages.isRead, false));
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteMessage(id: number): Promise<ActionResult> {
  await requireUser();
  await db.delete(messages).where(eq(messages.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}
