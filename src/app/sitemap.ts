import type { MetadataRoute } from "next";
import {
  getAuthorsWithPosts,
  getCategoriesWithCounts,
  getPagesForSitemap,
  getPostSlugsForSitemap,
} from "@/lib/data/content";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, categories, authors] = await Promise.all([
    getPostSlugsForSitemap(),
    getPagesForSitemap(),
    getCategoriesWithCounts(),
    getAuthorsWithPosts(),
  ]);

  const latest = posts.reduce<Date | undefined>(
    (max, p) => (!max || p.updatedAt > max ? p.updatedAt : max),
    undefined,
  );

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/best-platforms/"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/safety-tips/"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blog/"), lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about/"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact/"), changeFrequency: "yearly", priority: 0.4 },
  ];

  return [
    ...staticPages,
    ...posts
      .filter((p) => !p.noindex)
      .map((p) => ({
        url: absoluteUrl(`/${p.slug}/`),
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ...categories
      .filter((c) => c.postCount > 0)
      .map((c) => ({ url: absoluteUrl(`/category/${c.slug}/`), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...authors.map((a) => ({ url: absoluteUrl(`/author/${a.slug}/`), changeFrequency: "monthly" as const, priority: 0.4 })),
    ...pages
      .filter((p) => !p.noindex)
      .map((p) => ({
        url: absoluteUrl(`/${p.slug}/`),
        lastModified: p.updatedAt,
        changeFrequency: "yearly" as const,
        priority: 0.3,
      })),
  ];
}
