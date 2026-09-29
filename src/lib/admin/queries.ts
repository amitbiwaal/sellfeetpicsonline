import "server-only";
import { and, asc, count, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  authors,
  categories,
  media,
  messages,
  pages,
  platforms,
  posts,
  postTags,
  tags,
  users,
} from "@/lib/db/schema";

export const ADMIN_PAGE_SIZE = 20;

export async function getDashboardStats() {
  const [postCounts, pageCount, mediaCount, unread, messageCount] = await Promise.all([
    db.select({ status: posts.status, total: count() }).from(posts).groupBy(posts.status),
    db.select({ total: count() }).from(pages).get(),
    db.select({ total: count() }).from(media).get(),
    db.select({ total: count() }).from(messages).where(eq(messages.isRead, false)).get(),
    db.select({ total: count() }).from(messages).get(),
  ]);
  const byStatus = Object.fromEntries(postCounts.map((r) => [r.status, r.total]));
  return {
    published: byStatus.published ?? 0,
    drafts: byStatus.draft ?? 0,
    pages: pageCount?.total ?? 0,
    media: mediaCount?.total ?? 0,
    unreadMessages: unread?.total ?? 0,
    messages: messageCount?.total ?? 0,
  };
}

export async function countUnreadMessages() {
  const row = await db.select({ total: count() }).from(messages).where(eq(messages.isRead, false)).get();
  return row?.total ?? 0;
}

export async function listPosts({ q, status, page = 1 }: { q?: string; status?: string; page?: number }) {
  const conditions: SQL[] = [];
  if (status === "draft" || status === "published") conditions.push(eq(posts.status, status));
  if (q) {
    const term = `%${q}%`;
    conditions.push(or(like(posts.title, term), like(posts.slug, term))!);
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, total] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
        publishedAt: posts.publishedAt,
        updatedAt: posts.updatedAt,
        featuredImage: posts.featuredImage,
        categoryName: categories.name,
        authorName: authors.name,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(authors, eq(posts.authorId, authors.id))
      .where(where)
      .orderBy(desc(posts.updatedAt), desc(posts.id))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(posts).where(where).get(),
  ]);
  return { rows, total: total?.total ?? 0 };
}

export async function getPostForEdit(id: number) {
  const post = await db.select().from(posts).where(eq(posts.id, id)).get();
  if (!post) return null;
  const tagRows = await db
    .select({ name: tags.name })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, id))
    .orderBy(asc(tags.name));
  return { ...post, tags: tagRows.map((t) => t.name) };
}

export async function getEditorOptions() {
  const [authorRows, categoryRows, tagRows] = await Promise.all([
    db.select({ id: authors.id, name: authors.name }).from(authors).orderBy(asc(authors.name)),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ name: tags.name }).from(tags).orderBy(asc(tags.name)),
  ]);
  return { authors: authorRows, categories: categoryRows, tags: tagRows.map((t) => t.name) };
}

export async function listPages() {
  return db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      status: pages.status,
      updatedAt: pages.updatedAt,
      showInFooter: pages.showInFooter,
    })
    .from(pages)
    .orderBy(asc(pages.title));
}

export async function getPageForEdit(id: number) {
  return (await db.select().from(pages).where(eq(pages.id, id)).get()) ?? null;
}

export async function listCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      postCount: sql<number>`count(${posts.id})`,
    })
    .from(categories)
    .leftJoin(posts, eq(posts.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}

export async function listTagsWithCounts() {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      postCount: sql<number>`count(${postTags.postId})`,
    })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(asc(tags.name));
}

export async function listAuthorsWithCounts() {
  return db
    .select({
      id: authors.id,
      name: authors.name,
      slug: authors.slug,
      jobTitle: authors.jobTitle,
      avatar: authors.avatar,
      postCount: sql<number>`count(${posts.id})`,
    })
    .from(authors)
    .leftJoin(posts, eq(posts.authorId, authors.id))
    .groupBy(authors.id)
    .orderBy(asc(authors.name));
}

export async function getAuthorForEdit(id: number) {
  return (await db.select().from(authors).where(eq(authors.id, id)).get()) ?? null;
}

export async function listPlatforms() {
  return db.select().from(platforms).orderBy(asc(platforms.sortOrder), asc(platforms.id));
}

export async function getPlatformForEdit(id: number) {
  return (await db.select().from(platforms).where(eq(platforms.id, id)).get()) ?? null;
}

export async function listMessages({ filter, page = 1 }: { filter?: string; page?: number }) {
  const where = filter === "unread" ? eq(messages.isRead, false) : undefined;
  const [rows, total] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(where)
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(messages).where(where).get(),
  ]);
  return { rows, total: total?.total ?? 0 };
}

export async function listMediaItems({ q = "", offset = 0, limit = 40 }: { q?: string; offset?: number; limit?: number } = {}) {
  const term = q.trim() ? `%${q.trim()}%` : null;
  const where = term ? or(like(media.filename, term), like(media.alt, term), like(media.url, term)) : undefined;
  const [items, total] = await Promise.all([
    db
      .select()
      .from(media)
      .where(where)
      .orderBy(desc(media.createdAt), desc(media.id))
      .limit(Math.min(limit, 100))
      .offset(Math.max(0, offset)),
    db.select({ total: count() }).from(media).where(where).get(),
  ]);
  return { items, total: total?.total ?? 0 };
}

export async function listUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.id));
}

export async function listRecentPosts(limit = 6) {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .orderBy(desc(posts.updatedAt))
    .limit(limit);
}

export async function listRecentMessages(limit = 5) {
  return db.select().from(messages).orderBy(desc(messages.createdAt)).limit(limit);
}
