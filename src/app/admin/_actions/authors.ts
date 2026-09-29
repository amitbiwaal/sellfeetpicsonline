"use server";

import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { revalidateSite, validationError, type ActionResult } from "@/lib/admin/common";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { authors, posts } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => !v || /^https?:\/\//i.test(v), "Links must start with http:// or https://")
  .default("");

const authorSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1, "Please enter a name.").max(80),
  slug: z.string().trim().max(90).default(""),
  jobTitle: z.string().trim().max(120).default(""),
  bio: z.string().trim().max(1500).default(""),
  avatar: z.string().trim().max(600).default(""),
  website: optionalUrl,
  twitter: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
});

export type AuthorInput = z.input<typeof authorSchema>;

export async function saveAuthor(input: AuthorInput): Promise<ActionResult<{ id: number }>> {
  await requireUser();
  const parsed = authorSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { id, ...data } = parsed.data;
  const slug = slugify(data.slug || data.name);
  if (!slug) return { ok: false, error: "Please enter a valid slug.", fieldErrors: { slug: "Invalid slug" } };

  const clash = await db
    .select({ id: authors.id })
    .from(authors)
    .where(id ? and(eq(authors.slug, slug), ne(authors.id, id)) : eq(authors.slug, slug))
    .get();
  if (clash) return { ok: false, error: "Another author already uses this URL.", fieldErrors: { slug: "Already in use" } };

  const values = { ...data, slug };
  let savedId = id;
  if (id) await db.update(authors).set(values).where(eq(authors.id, id));
  else savedId = (await db.insert(authors).values(values).returning({ id: authors.id }).get()).id;

  revalidateSite();
  return { ok: true, id: savedId! };
}

export async function deleteAuthor(id: number): Promise<ActionResult> {
  await requireUser();
  await db.update(posts).set({ authorId: null }).where(eq(posts.authorId, id));
  await db.delete(authors).where(eq(authors.id, id));
  revalidateSite();
  return { ok: true };
}
