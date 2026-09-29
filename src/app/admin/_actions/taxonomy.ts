"use server";

import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { revalidateSite, validationError, type ActionResult } from "@/lib/admin/common";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { categories, posts, postTags, tags } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1, "Please enter a name.").max(80),
  slug: z.string().trim().max(90).default(""),
  description: z.string().trim().max(400).default(""),
});

export async function saveCategory(input: z.input<typeof categorySchema>): Promise<ActionResult<{ id: number }>> {
  await requireUser();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { id, name, description } = parsed.data;
  const slug = slugify(parsed.data.slug || name);
  if (!slug) return { ok: false, error: "Please enter a valid slug.", fieldErrors: { slug: "Invalid slug" } };

  const clash = await db
    .select({ id: categories.id })
    .from(categories)
    .where(id ? and(eq(categories.slug, slug), ne(categories.id, id)) : eq(categories.slug, slug))
    .get();
  if (clash) return { ok: false, error: "Another category already uses this slug.", fieldErrors: { slug: "Already in use" } };

  let savedId = id;
  if (id) await db.update(categories).set({ name, slug, description }).where(eq(categories.id, id));
  else savedId = (await db.insert(categories).values({ name, slug, description }).returning({ id: categories.id }).get()).id;

  revalidateSite();
  return { ok: true, id: savedId! };
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  await requireUser();
  await db.update(posts).set({ categoryId: null }).where(eq(posts.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
  revalidateSite();
  return { ok: true };
}

const tagSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1, "Please enter a name.").max(60),
  slug: z.string().trim().max(70).default(""),
});

export async function saveTag(input: z.input<typeof tagSchema>): Promise<ActionResult<{ id: number }>> {
  await requireUser();
  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { id, name } = parsed.data;
  const slug = slugify(parsed.data.slug || name, 60);
  if (!slug) return { ok: false, error: "Please enter a valid slug.", fieldErrors: { slug: "Invalid slug" } };

  const clash = await db
    .select({ id: tags.id })
    .from(tags)
    .where(id ? and(eq(tags.slug, slug), ne(tags.id, id)) : eq(tags.slug, slug))
    .get();
  if (clash) return { ok: false, error: "Another tag already uses this slug.", fieldErrors: { slug: "Already in use" } };

  let savedId = id;
  if (id) await db.update(tags).set({ name, slug }).where(eq(tags.id, id));
  else savedId = (await db.insert(tags).values({ name, slug }).returning({ id: tags.id }).get()).id;

  revalidateSite();
  return { ok: true, id: savedId! };
}

export async function deleteTag(id: number): Promise<ActionResult> {
  await requireUser();
  await db.delete(postTags).where(eq(postTags.tagId, id));
  await db.delete(tags).where(eq(tags.id, id));
  revalidateSite();
  return { ok: true };
}
