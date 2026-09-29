import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

/** Admin panel logins. */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] })
    .notNull()
    .default("admin"),
  /** Bumped on password change / logout-everywhere to invalidate old sessions. */
  sessionVersion: integer("session_version").notNull().default(0),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: createdAt(),
});

/** Public author profiles shown on posts (E-E-A-T). */
export const authors = sqliteTable("authors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  jobTitle: text("job_title").notNull().default(""),
  bio: text("bio").notNull().default(""),
  avatar: text("avatar").notNull().default(""),
  website: text("website").notNull().default(""),
  twitter: text("twitter").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  linkedin: text("linkedin").notNull().default(""),
  createdAt: createdAt(),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  createdAt: createdAt(),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: createdAt(),
});

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""),
    featuredImage: text("featured_image").notNull().default(""),
    featuredImageAlt: text("featured_image_alt").notNull().default(""),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    authorId: integer("author_id").references(() => authors.id, {
      onDelete: "set null",
    }),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    noindex: integer("noindex", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("posts_status_published_idx").on(t.status, t.publishedAt),
    index("posts_category_idx").on(t.categoryId),
    index("posts_author_idx").on(t.authorId),
  ],
);

export const postTags = sqliteTable(
  "post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.tagId] }),
    index("post_tags_tag_idx").on(t.tagId),
  ],
);

/** Simple CMS pages (legal pages, etc.) rendered at /{slug}/. */
export const pages = sqliteTable("pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  intro: text("intro").notNull().default(""),
  content: text("content").notNull().default(""),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  noindex: integer("noindex", { mode: "boolean" }).notNull().default(false),
  showInFooter: integer("show_in_footer", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull().unique(),
  storageKey: text("storage_key").notNull().default(""),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull().default(""),
  size: integer("size").notNull().default(0),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt").notNull().default(""),
  createdAt: createdAt(),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

/** Platforms shown on the homepage and the Best Platforms page. */
export const platforms = sqliteTable("platforms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  rating: real("rating").notNull().default(4.5),
  score: real("score"),
  bestFor: text("best_for").notNull().default(""),
  payoutSpeed: text("payout_speed").notNull().default(""),
  sellerCost: text("seller_cost").notNull().default(""),
  commission: text("commission").notNull().default(""),
  buyerTraffic: text("buyer_traffic").notNull().default(""),
  summary: text("summary").notNull().default(""),
  websiteUrl: text("website_url").notNull().default(""),
  reviewUrl: text("review_url").notNull().default(""),
  isTopPick: integer("is_top_pick", { mode: "boolean" })
    .notNull()
    .default(false),
  showOnHome: integer("show_on_home", { mode: "boolean" })
    .notNull()
    .default(false),
  isPublished: integer("is_published", { mode: "boolean" })
    .notNull()
    .default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Key/value site settings editable from the admin panel. */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export type User = typeof users.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Platform = typeof platforms.$inferSelect;
