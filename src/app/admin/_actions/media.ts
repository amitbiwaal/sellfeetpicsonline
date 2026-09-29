"use server";

import { eq, or, sql } from "drizzle-orm";
import type { ActionResult } from "@/lib/admin/common";
import { listMediaItems } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { authors, media, pages, posts, type Media } from "@/lib/db/schema";
import { deleteUpload } from "@/lib/storage";

export async function listMedia(options: { q?: string; offset?: number; limit?: number } = {}): Promise<{
  items: Media[];
  total: number;
}> {
  await requireUser();
  return listMediaItems(options);
}

export async function updateMediaAlt(id: number, alt: string): Promise<ActionResult> {
  await requireUser();
  await db
    .update(media)
    .set({ alt: alt.trim().slice(0, 250) })
    .where(eq(media.id, id));
  return { ok: true };
}

/** Where an image is used, so deleting it can say what would break. */
export async function getMediaUsage(id: number): Promise<string[]> {
  await requireUser();
  const item = await db.select({ url: media.url }).from(media).where(eq(media.id, id)).get();
  if (!item) return [];
  const { url } = item;
  const [postRows, pageRows, authorRows] = await Promise.all([
    db
      .select({ title: posts.title })
      .from(posts)
      .where(or(eq(posts.featuredImage, url), sql`instr(${posts.content}, ${url}) > 0`)),
    db.select({ title: pages.title }).from(pages).where(sql`instr(${pages.content}, ${url}) > 0`),
    db.select({ name: authors.name }).from(authors).where(eq(authors.avatar, url)),
  ]);
  return [
    ...postRows.map((p) => `Post: ${p.title}`),
    ...pageRows.map((p) => `Page: ${p.title}`),
    ...authorRows.map((a) => `Author photo: ${a.name}`),
  ];
}

export async function deleteMedia(id: number): Promise<ActionResult> {
  await requireUser();
  const item = await db.select().from(media).where(eq(media.id, id)).get();
  if (!item) return { ok: true };
  if (item.storageKey) await deleteUpload(item.storageKey);
  await db.delete(media).where(eq(media.id, id));
  return { ok: true };
}
