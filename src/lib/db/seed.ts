import fs from "node:fs";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import { sanitizeContent } from "@/lib/content/html";
import { SETTINGS_DEFAULTS } from "@/lib/settings";
import { db } from "./index";
import {
  authors,
  categories,
  media,
  pages,
  platforms,
  posts,
  postTags,
  settings,
  tags,
} from "./schema";

const SEED_DIR = path.join(process.cwd(), "content", "seed");
const SEEDED_KEY = "seeded_at";

type WordPressSeed = {
  authors: Array<{ name: string; slug: string; jobTitle: string; bio: string; avatar: string }>;
  categories: Array<{ name: string; slug: string; description: string }>;
  tags: Array<{ name: string; slug: string }>;
  posts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    featuredImageAlt: string;
    status: "draft" | "published";
    publishedAt: string;
    updatedAt: string;
    author: string;
    category: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
  }>;
  media: Array<{
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
    alt: string;
  }>;
};

type PlatformSeed = {
  name: string;
  slug: string;
  rating: number;
  score: number | null;
  bestFor: string;
  payoutSpeed: string;
  sellerCost: string;
  commission: string;
  buyerTraffic: string;
  summary: string;
  reviewUrl: string;
  websiteUrl?: string;
  isTopPick?: boolean;
  showOnHome?: boolean;
};

type PageSeed = { slug: string; title: string; intro: string; seoDescription: string };

function readJson<T>(...parts: string[]): T {
  return JSON.parse(fs.readFileSync(path.join(SEED_DIR, ...parts), "utf8")) as T;
}

export async function isSeeded() {
  const row = await db.select().from(settings).where(eq(settings.key, SEEDED_KEY)).get();
  return Boolean(row);
}

/**
 * Load the starter content (imported WordPress posts, legal pages, platforms
 * and default settings). Runs only once unless `force` is set, so it never
 * brings back content that was deleted in the admin panel.
 */
export async function seedDatabase({ force = false } = {}) {
  if (!force && (await isSeeded())) return { skipped: true as const };

  const wp = readJson<WordPressSeed>("wordpress.json");
  const platformSeed = readJson<PlatformSeed[]>("platforms.json");
  const pageSeed = readJson<PageSeed[]>("pages", "index.json");

  // Settings defaults (existing values are kept).
  for (const [key, value] of Object.entries(SETTINGS_DEFAULTS)) {
    await db.insert(settings).values({ key, value }).onConflictDoNothing();
  }

  for (const author of wp.authors) {
    await db
      .insert(authors)
      .values({
        name: author.name,
        slug: author.slug,
        jobTitle: author.jobTitle,
        bio: author.bio,
        avatar: author.avatar,
      })
      .onConflictDoNothing();
  }

  for (const category of wp.categories) {
    await db.insert(categories).values(category).onConflictDoNothing();
  }

  for (const tag of wp.tags) {
    await db.insert(tags).values(tag).onConflictDoNothing();
  }

  const authorRows = await db.select({ id: authors.id, slug: authors.slug }).from(authors);
  const categoryRows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  const authorIds = new Map(authorRows.map((r) => [r.slug, r.id]));
  const categoryIds = new Map(categoryRows.map((r) => [r.slug, r.id]));

  let postCount = 0;
  for (const post of wp.posts) {
    const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, post.slug)).get();
    if (existing) continue;

    const inserted = await db
      .insert(posts)
      .values({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: sanitizeContent(post.content),
        featuredImage: post.featuredImage,
        featuredImageAlt: post.featuredImageAlt,
        status: post.status,
        publishedAt: new Date(post.publishedAt),
        authorId: authorIds.get(post.author) ?? null,
        categoryId: categoryIds.get(post.category) ?? null,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        createdAt: new Date(post.publishedAt),
        updatedAt: new Date(post.updatedAt),
      })
      .returning({ id: posts.id })
      .get();

    if (post.tags.length) {
      const tagRows = await db
        .select({ id: tags.id })
        .from(tags)
        .where(inArray(tags.slug, post.tags));
      if (tagRows.length) {
        await db
          .insert(postTags)
          .values(tagRows.map((t) => ({ postId: inserted.id, tagId: t.id })))
          .onConflictDoNothing();
      }
    }
    postCount++;
  }

  for (const page of pageSeed) {
    const html = fs.readFileSync(path.join(SEED_DIR, "pages", `${page.slug}.html`), "utf8");
    await db
      .insert(pages)
      .values({
        title: page.title,
        slug: page.slug,
        intro: page.intro,
        content: sanitizeContent(html),
        status: "published",
        seoDescription: page.seoDescription,
        showInFooter: true,
      })
      .onConflictDoNothing();
  }

  for (const [index, platform] of platformSeed.entries()) {
    await db
      .insert(platforms)
      .values({
        name: platform.name,
        slug: platform.slug,
        rating: platform.rating,
        score: platform.score,
        bestFor: platform.bestFor,
        payoutSpeed: platform.payoutSpeed,
        sellerCost: platform.sellerCost,
        commission: platform.commission,
        buyerTraffic: platform.buyerTraffic,
        summary: platform.summary,
        reviewUrl: platform.reviewUrl,
        websiteUrl: platform.websiteUrl ?? "",
        isTopPick: Boolean(platform.isTopPick),
        showOnHome: Boolean(platform.showOnHome),
        isPublished: true,
        sortOrder: index + 1,
      })
      .onConflictDoNothing();
  }

  for (const item of wp.media) {
    await db
      .insert(media)
      .values({
        url: item.url,
        storageKey: "",
        filename: item.filename,
        mimeType: item.mimeType,
        size: item.size,
        width: item.width,
        height: item.height,
        alt: item.alt,
      })
      .onConflictDoNothing();
  }

  await db
    .insert(settings)
    .values({ key: SEEDED_KEY, value: new Date().toISOString() })
    .onConflictDoUpdate({ target: settings.key, set: { value: new Date().toISOString() } });

  return {
    skipped: false as const,
    posts: postCount,
    pages: pageSeed.length,
    platforms: platformSeed.length,
    media: wp.media.length,
  };
}
