import "server-only";
import { cache } from "react";
import { and, asc, count, desc, eq, inArray, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  authors,
  categories,
  media,
  pages,
  platforms,
  posts,
  postTags,
  tags,
} from "@/lib/db/schema";

export const POSTS_PER_PAGE = 12;

export type PostCard = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  publishedAt: Date | null;
  updatedAt: Date;
  category: { name: string; slug: string } | null;
  author: { name: string; slug: string; avatar: string } | null;
};

const cardColumns = {
  id: posts.id,
  title: posts.title,
  slug: posts.slug,
  excerpt: posts.excerpt,
  featuredImage: posts.featuredImage,
  featuredImageAlt: posts.featuredImageAlt,
  publishedAt: posts.publishedAt,
  updatedAt: posts.updatedAt,
  categoryName: categories.name,
  categorySlug: categories.slug,
  authorName: authors.name,
  authorSlug: authors.slug,
  authorAvatar: authors.avatar,
};

type CardRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  publishedAt: Date | null;
  updatedAt: Date;
  categoryName: string | null;
  categorySlug: string | null;
  authorName: string | null;
  authorSlug: string | null;
  authorAvatar: string | null;
};

function toCard(row: CardRow): PostCard {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    featuredImage: row.featuredImage,
    featuredImageAlt: row.featuredImageAlt,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    category: row.categoryName && row.categorySlug ? { name: row.categoryName, slug: row.categorySlug } : null,
    author:
      row.authorName && row.authorSlug
        ? { name: row.authorName, slug: row.authorSlug, avatar: row.authorAvatar ?? "" }
        : null,
  };
}

/** Published and not scheduled for the future. */
function isLive() {
  return and(eq(posts.status, "published"), lte(posts.publishedAt, new Date()));
}

type PostFilter = {
  categoryId?: number;
  tagId?: number;
  authorId?: number;
  excludeId?: number;
};

function filterConditions(filter: PostFilter = {}) {
  const conditions: SQL[] = [isLive()!];
  if (filter.categoryId) conditions.push(eq(posts.categoryId, filter.categoryId));
  if (filter.authorId) conditions.push(eq(posts.authorId, filter.authorId));
  if (filter.excludeId) conditions.push(ne(posts.id, filter.excludeId));
  if (filter.tagId) {
    conditions.push(
      inArray(posts.id, db.select({ id: postTags.postId }).from(postTags).where(eq(postTags.tagId, filter.tagId))),
    );
  }
  return and(...conditions);
}

export async function getPublishedPosts(options: PostFilter & { limit?: number; offset?: number } = {}) {
  const { limit = POSTS_PER_PAGE, offset = 0, ...filter } = options;
  const rows = await db
    .select(cardColumns)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(filterConditions(filter))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(limit)
    .offset(offset);
  return rows.map(toCard);
}

export async function countPublishedPosts(filter: PostFilter = {}) {
  const row = await db.select({ total: count() }).from(posts).where(filterConditions(filter)).get();
  return row?.total ?? 0;
}

export const getPostBySlug = cache(async (slug: string, includeDrafts = false) => {
  const row = await db
    .select({
      post: posts,
      category: { id: categories.id, name: categories.name, slug: categories.slug },
      author: authors,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(includeDrafts ? eq(posts.slug, slug) : and(eq(posts.slug, slug), isLive()))
    .get();
  if (!row) return null;

  const postTagRows = await db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, row.post.id))
    .orderBy(asc(tags.name));

  return {
    ...row.post,
    category: row.category?.id ? row.category : null,
    author: row.author?.id ? row.author : null,
    tags: postTagRows,
  };
});

export type FullPost = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;

/** Posts from the same category first, topped up with the latest posts. */
export async function getRelatedPosts(post: { id: number; categoryId: number | null }, limit = 3) {
  const sameCategory = post.categoryId
    ? await getPublishedPosts({ categoryId: post.categoryId, excludeId: post.id, limit })
    : [];
  if (sameCategory.length >= limit) return sameCategory;
  const latest = await getPublishedPosts({ excludeId: post.id, limit: limit + sameCategory.length });
  const seen = new Set(sameCategory.map((p) => p.id));
  return [...sameCategory, ...latest.filter((p) => !seen.has(p.id))].slice(0, limit);
}

export async function searchPosts(query: string, limit = 30) {
  const term = `%${query.replace(/[%_]/g, (c) => `\\${c}`)}%`;
  const matches = or(
    sql`${posts.title} LIKE ${term} ESCAPE '\\'`,
    sql`${posts.excerpt} LIKE ${term} ESCAPE '\\'`,
    sql`${posts.content} LIKE ${term} ESCAPE '\\'`,
  );
  const rows = await db
    .select(cardColumns)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(and(isLive(), matches))
    .orderBy(
      desc(sql`CASE WHEN ${posts.title} LIKE ${term} ESCAPE '\\' THEN 1 ELSE 0 END`),
      desc(posts.publishedAt),
    )
    .limit(limit);
  return rows.map(toCard);
}

export async function getPostSlugsForSitemap() {
  return db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt, publishedAt: posts.publishedAt, noindex: posts.noindex })
    .from(posts)
    .where(isLive())
    .orderBy(desc(posts.publishedAt));
}

/* ---------------- Categories, tags and authors ---------------- */

export const getCategoryBySlug = cache(async (slug: string) => {
  return (await db.select().from(categories).where(eq(categories.slug, slug)).get()) ?? null;
});

export const getCategoriesWithCounts = cache(async () => {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      postCount: sql<number>`count(${posts.id})`,
    })
    .from(categories)
    .leftJoin(posts, and(eq(posts.categoryId, categories.id), isLive()))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
  return rows.map((r) => ({ ...r, postCount: Number(r.postCount) }));
});

export const getTagBySlug = cache(async (slug: string) => {
  return (await db.select().from(tags).where(eq(tags.slug, slug)).get()) ?? null;
});

export const getAuthorBySlug = cache(async (slug: string) => {
  return (await db.select().from(authors).where(eq(authors.slug, slug)).get()) ?? null;
});

export const getAuthorsWithPosts = cache(async () => {
  const rows = await db
    .select({ id: authors.id, name: authors.name, slug: authors.slug, postCount: sql<number>`count(${posts.id})` })
    .from(authors)
    .innerJoin(posts, and(eq(posts.authorId, authors.id), isLive()))
    .groupBy(authors.id);
  return rows.map((r) => ({ ...r, postCount: Number(r.postCount) }));
});

/** The main author shown on the About page. */
export const getLeadAuthor = cache(async () => {
  const rows = await db
    .select({ author: authors, postCount: sql<number>`count(${posts.id})` })
    .from(authors)
    .leftJoin(posts, and(eq(posts.authorId, authors.id), isLive()))
    .groupBy(authors.id)
    .orderBy(desc(sql`count(${posts.id})`), asc(authors.id))
    .limit(1);
  return rows[0]?.author ?? null;
});

/* ---------------- CMS pages ---------------- */

export const getPageBySlug = cache(async (slug: string, includeDrafts = false) => {
  const where = includeDrafts ? eq(pages.slug, slug) : and(eq(pages.slug, slug), eq(pages.status, "published"));
  return (await db.select().from(pages).where(where).get()) ?? null;
});

export const getFooterPages = cache(async () => {
  return db
    .select({ title: pages.title, slug: pages.slug })
    .from(pages)
    .where(and(eq(pages.status, "published"), eq(pages.showInFooter, true)))
    .orderBy(asc(pages.id));
});

export async function getPagesForSitemap() {
  return db
    .select({ slug: pages.slug, updatedAt: pages.updatedAt, noindex: pages.noindex })
    .from(pages)
    .where(eq(pages.status, "published"));
}

/* ---------------- Media ---------------- */

/** Stored width/height for an image URL (used to size featured images). */
export const getImageSize = cache(async (url: string) => {
  if (!url) return null;
  const row = await db
    .select({ width: media.width, height: media.height })
    .from(media)
    .where(eq(media.url, url))
    .get();
  return row?.width && row?.height ? { width: row.width, height: row.height } : null;
});

/* ---------------- Platforms ---------------- */

export const getHomePlatforms = cache(async () => {
  return db
    .select()
    .from(platforms)
    .where(and(eq(platforms.isPublished, true), eq(platforms.showOnHome, true)))
    .orderBy(desc(platforms.rating), asc(platforms.sortOrder))
    .limit(8);
});

export const getPublishedPlatforms = cache(async () => {
  return db
    .select()
    .from(platforms)
    .where(eq(platforms.isPublished, true))
    .orderBy(asc(platforms.sortOrder), asc(platforms.id));
});
