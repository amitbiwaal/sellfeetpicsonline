import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages, posts } from "@/lib/db/schema";
import { RESERVED_SLUGS } from "@/lib/site";

/** Posts and pages share the /{slug}/ namespace; returns an error message or null. */
export async function slugProblem(slug: string, self: { type: "post" | "page"; id?: number }) {
  if (!slug) return "Please add a URL slug.";
  if (RESERVED_SLUGS.has(slug)) return `"/${slug}/" is used by the site itself. Please choose another URL.`;

  const post = await db
    .select({ id: posts.id })
    .from(posts)
    .where(self.type === "post" && self.id ? and(eq(posts.slug, slug), ne(posts.id, self.id)) : eq(posts.slug, slug))
    .get();
  if (post) return "Another post already uses this URL.";

  const page = await db
    .select({ id: pages.id })
    .from(pages)
    .where(self.type === "page" && self.id ? and(eq(pages.slug, slug), ne(pages.id, self.id)) : eq(pages.slug, slug))
    .get();
  if (page) return "A page already uses this URL.";

  return null;
}
