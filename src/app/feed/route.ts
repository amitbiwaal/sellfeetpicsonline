import { getPublishedPosts } from "@/lib/data/content";
import { getSettings } from "@/lib/data/settings";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 2.0 feed at /feed/ (same address as the old WordPress feed). */
export async function GET() {
  const [settings, posts] = await Promise.all([getSettings(), getPublishedPosts({ limit: 30 })]);
  const lastBuild = posts[0]?.updatedAt ?? new Date();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/${post.slug}/`);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${(post.publishedAt ?? post.updatedAt).toUTCString()}</pubDate>
      ${post.author ? `<dc:creator>${escapeXml(post.author.name)}</dc:creator>` : ""}
      ${post.category ? `<category>${escapeXml(post.category.name)}</category>` : ""}
      <description>${escapeXml(post.excerpt)}</description>
      ${post.featuredImage ? `<enclosure url="${escapeXml(absoluteUrl(post.featuredImage))}" type="image/${post.featuredImage.split(".").pop()?.replace("jpg", "jpeg") ?? "jpeg"}" length="0" />` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(settings.site_name)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(settings.tagline)}</description>
    <language>en-US</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed/" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
