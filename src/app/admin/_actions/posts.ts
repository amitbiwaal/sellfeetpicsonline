"use server";

import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { revalidateSite, SESSION_ENDED_ERROR, toDateOrNull, validationError, type ActionResult } from "@/lib/admin/common";
import { slugProblem } from "@/lib/admin/slugs";
import { getCurrentUser, requireUser } from "@/lib/auth/dal";
import { sanitizeContent } from "@/lib/content/html";
import { db } from "@/lib/db";
import { posts, postTags, tags } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

const postSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(1, "Please add a title.").max(200, "Title is too long (max 200 characters)."),
  slug: z.string().trim().max(120).default(""),
  excerpt: z.string().trim().max(500, "Excerpt is too long (max 500 characters).").default(""),
  content: z.string().max(3_000_000, "Content is too large.").default(""),
  featuredImage: z.string().trim().max(600).default(""),
  featuredImageAlt: z.string().trim().max(250).default(""),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().nullable().optional(),
  authorId: z.number().int().positive().nullable(),
  categoryId: z.number().int().positive().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(40).default([]),
  seoTitle: z.string().trim().max(200).default(""),
  seoDescription: z.string().trim().max(320).default(""),
  noindex: z.boolean().default(false),
});

export type PostInput = z.input<typeof postSchema>;

async function syncPostTags(postId: number, names: string[]) {
  const bySlug = new Map<string, string>();
  for (const name of names) {
    const slug = slugify(name, 60);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, name.trim());
  }

  const tagIds: number[] = [];
  if (bySlug.size) {
    const existing = await db.select().from(tags).where(inArray(tags.slug, [...bySlug.keys()]));
    const known = new Map(existing.map((t) => [t.slug, t.id]));
    for (const [slug, name] of bySlug) {
      let id = known.get(slug);
      if (!id) {
        const created = await db.insert(tags).values({ name, slug }).returning({ id: tags.id }).get();
        id = created.id;
      }
      tagIds.push(id);
    }
  }

  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (tagIds.length) {
    await db
      .insert(postTags)
      .values(tagIds.map((tagId) => ({ postId, tagId })))
      .onConflictDoNothing();
  }
}

export async function savePost(input: PostInput): Promise<ActionResult<{ id: number; slug: string }>> {
  if (!(await getCurrentUser())) return { ok: false, error: SESSION_ENDED_ERROR };
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;

  const slug = slugify(data.slug || data.title);
  const problem = await slugProblem(slug, { type: "post", id: data.id });
  if (problem) return { ok: false, error: problem, fieldErrors: { slug: problem } };

  let publishedAt = toDateOrNull(data.publishedAt);
  if (data.status === "published" && !publishedAt) publishedAt = new Date();

  const values = {
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: sanitizeContent(data.content),
    featuredImage: data.featuredImage,
    featuredImageAlt: data.featuredImageAlt,
    status: data.status,
    publishedAt,
    authorId: data.authorId,
    categoryId: data.categoryId,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    noindex: data.noindex,
    updatedAt: new Date(),
  };

  let id = data.id;
  if (id) {
    const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id)).get();
    if (!existing) return { ok: false, error: "This post no longer exists." };
    await db.update(posts).set(values).where(eq(posts.id, id));
  } else {
    const created = await db.insert(posts).values(values).returning({ id: posts.id }).get();
    id = created.id;
  }

  await syncPostTags(id, data.tags);
  revalidateSite();
  return { ok: true, id, slug };
}

export async function deletePost(id: number): Promise<ActionResult> {
  await requireUser();
  await db.delete(postTags).where(eq(postTags.postId, id));
  await db.delete(posts).where(eq(posts.id, id));
  revalidateSite();
  return { ok: true };
}

export async function duplicatePost(id: number): Promise<ActionResult<{ id: number }>> {
  await requireUser();
  const original = await db.select().from(posts).where(eq(posts.id, id)).get();
  if (!original) return { ok: false, error: "Post not found." };

  let slug = `${original.slug}-copy`.slice(0, 110);
  for (let i = 2; await slugProblem(slug, { type: "post" }); i++) slug = `${original.slug}-copy-${i}`.slice(0, 110);

  const created = await db
    .insert(posts)
    .values({
      title: `${original.title} (copy)`,
      slug,
      excerpt: original.excerpt,
      content: original.content,
      featuredImage: original.featuredImage,
      featuredImageAlt: original.featuredImageAlt,
      status: "draft",
      publishedAt: null,
      authorId: original.authorId,
      categoryId: original.categoryId,
      seoTitle: original.seoTitle,
      seoDescription: original.seoDescription,
      noindex: original.noindex,
    })
    .returning({ id: posts.id })
    .get();

  const tagRows = await db.select({ tagId: postTags.tagId }).from(postTags).where(eq(postTags.postId, id));
  if (tagRows.length) {
    await db.insert(postTags).values(tagRows.map((t) => ({ postId: created.id, tagId: t.tagId })));
  }
  return { ok: true, id: created.id };
}
