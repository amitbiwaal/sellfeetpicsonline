/**
 * One-time WordPress → Next.js content importer.
 *
 *   npm run import:wordpress                      # imports from https://sellfeetonline.com
 *   npm run import:wordpress -- https://example.com
 *
 * Reads the public WP REST API, cleans the post HTML, downloads every image
 * into public/wp-content/uploads (so old image URLs keep working) and writes
 * content/seed/wordpress.json, which `npm run db:seed` loads into the database.
 */
import fs from "node:fs";
import path from "node:path";
import { parse, type HTMLElement } from "node-html-parser";
import sharp from "sharp";
import { sanitizeContent } from "../src/lib/content/html";
import { decodeEntities, stripHtml, truncate } from "../src/lib/utils";

const SOURCE = (process.argv[2] || "https://sellfeetonline.com").replace(/\/+$/, "");
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_FILE = path.join(ROOT, "content", "seed", "wordpress.json");
const UA = "Mozilla/5.0 (compatible; SellFeetOnline-Importer/1.0)";

/** Every post is published under this author profile. */
const DEFAULT_AUTHOR = {
  name: "Jessica Harper",
  slug: "jessica-harper",
  jobTitle: "Platform Reviewer & Seller Safety Writer",
};

const CATEGORIES = [
  {
    name: "Guides",
    slug: "guides",
    description:
      "Step-by-step guides for beginners: taking better photos, pricing, finding buyers and staying safe.",
  },
  {
    name: "Platform Reviews",
    slug: "platform-reviews",
    description:
      "Honest reviews and comparisons of the platforms where you can sell feet pics, checked against their current terms.",
  },
];

/** Category + hand-written SEO copy for the posts that exist today. */
const POST_OVERRIDES: Record<string, { category: string; description: string }> = {
  "what-is-feetfinder-a-beginners-guide-to-the-platform-2026": {
    category: "platform-reviews",
    description:
      "What is FeetFinder and how does it work? Our 2026 beginner's guide covers sign-up, verification, fees, payouts, safety and who the platform suits best.",
  },
  "feet-pics-to-sell-the-complete-2026-guide-to-selling-feet-pics-online": {
    category: "guides",
    description:
      "Learn how to sell feet pics online in 2026: where to sell, photos buyers want, pricing, staying anonymous, avoiding scams and realistic earnings.",
  },
  "fun-with-feet-reviews": {
    category: "platform-reviews",
    description:
      "Our honest Fun With Feet review for 2026: pricing, commission, payouts, real creator earnings, pros and cons, and who should join or avoid it.",
  },
  "best-places-to-sell-feet-pics-online": {
    category: "platform-reviews",
    description:
      "We compared 13 active sites to sell feet pics in 2026 by buyer traffic, fees, commission and payout reliability. See why FeetFinder ranks first.",
  },
};

type WpRendered = { rendered: string };
type WpPost = {
  id: number;
  slug: string;
  status: string;
  date_gmt: string;
  modified_gmt: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  featured_media: number;
  tags: number[];
  categories: number[];
};
type WpTerm = { id: number; name: string; slug: string; description?: string };
type WpUser = { id: number; name: string; slug: string; description: string };
type WpMedia = {
  id: number;
  source_url: string;
  alt_text: string;
  mime_type: string;
  media_details?: { width?: number; height?: number; sizes?: Record<string, { source_url: string }> };
};

async function getJson<T>(endpoint: string): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page < 50; page++) {
    const url = `${SOURCE}/wp-json/wp/v2/${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=100&page=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 400 && page > 1) break; // past the last page
    if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
    const batch = (await res.json()) as T[];
    all.push(...batch);
    const totalPages = Number(res.headers.get("x-wp-totalpages") || "1");
    if (page >= totalPages) break;
  }
  return all;
}

type LocalImage = {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
};

const downloaded = new Map<string, LocalImage>();

/** Download an uploads URL into /public, keeping the same path. */
async function downloadImage(remoteUrl: string, alt = ""): Promise<LocalImage | null> {
  const url = new URL(remoteUrl, SOURCE);
  if (!url.pathname.startsWith("/wp-content/uploads/")) return null;
  const localUrl = decodeURIComponent(url.pathname);
  const cached = downloaded.get(localUrl);
  if (cached) {
    if (alt && !cached.alt) cached.alt = alt;
    return cached;
  }

  const target = path.join(PUBLIC_DIR, ...localUrl.split("/").filter(Boolean));
  if (!fs.existsSync(target)) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.warn(`  ! could not download ${url} (${res.status})`);
      return null;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    console.log(`  ↓ ${localUrl}`);
  }

  // Heavy PNG/JPG files get a lighter WebP copy next to them. The site uses the
  // copy; the original stays in place so old links keep working.
  let finalPath = target;
  let finalUrl = localUrl;
  const originalExt = path.extname(target).toLowerCase();
  if ([".png", ".jpg", ".jpeg"].includes(originalExt) && fs.statSync(target).size > 300 * 1024) {
    const webpPath = target.slice(0, -originalExt.length) + ".webp";
    if (!fs.existsSync(webpPath)) {
      await sharp(target)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(webpPath);
      console.log(`  ⇢ ${path.basename(webpPath)} (${Math.round(fs.statSync(webpPath).size / 1024)} KB)`);
    }
    finalPath = webpPath;
    finalUrl = localUrl.slice(0, -originalExt.length) + ".webp";
  }

  const meta = await sharp(finalPath).metadata().catch(() => null);
  const ext = path.extname(finalPath).slice(1).toLowerCase();
  const info: LocalImage = {
    url: finalUrl,
    filename: path.basename(finalPath),
    mimeType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
    size: fs.statSync(finalPath).size,
    width: meta?.width ?? null,
    height: meta?.height ?? null,
    alt,
  };
  downloaded.set(localUrl, info);
  return info;
}

/** "image-3-1024x325.png" → "image-3.png" (WordPress resized copies). */
function originalImageUrl(src: string) {
  return src.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, "$1");
}

async function cleanPostHtml(html: string) {
  const root = parse(html, { comment: false });

  // Author box injected by the "WP Post Author" plugin and any stray scripts.
  root
    .querySelectorAll(".wp-post-author-wrap, .awpa-title, script, style, noscript")
    .forEach((el) => el.remove());

  // <figure class="wp-block-table"><table> → <table>
  for (const figure of root.querySelectorAll("figure")) {
    const table = figure.querySelector("table");
    const img = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    if (table && !caption) figure.replaceWith(table.outerHTML);
    else if (img && !caption) figure.replaceWith(img.outerHTML);
  }

  // Headings are bold already: <h2><strong>Title</strong></h2> → <h2>Title</h2>
  for (const heading of root.querySelectorAll("h2, h3, h4")) {
    const strong = heading.querySelector("strong");
    if (strong && strong.text.trim() === heading.text.trim()) heading.innerHTML = strong.innerHTML;
  }

  // Header row written as <td><strong>…</strong></td> → <th>…</th>
  for (const table of root.querySelectorAll("table")) {
    const firstRow = table.querySelector("tr");
    if (!firstRow) continue;
    const cells = firstRow.querySelectorAll("td");
    const allBold =
      cells.length > 0 &&
      cells.every((cell) => {
        const strong = cell.querySelector("strong");
        return strong && strong.text.trim() === cell.text.trim();
      });
    if (allBold) {
      for (const cell of cells) {
        cell.replaceWith(`<th>${cell.querySelector("strong")!.innerHTML}</th>`);
      }
    }
  }

  for (const img of root.querySelectorAll("img")) {
    const src = img.getAttribute("src") ?? "";
    const original = originalImageUrl(src);
    const alt = decodeEntities(img.getAttribute("alt") ?? "");
    const local = (await downloadImage(original, alt)) ?? (await downloadImage(src, alt));
    for (const attr of Object.keys(img.attributes)) {
      if (!["src", "alt", "width", "height"].includes(attr)) img.removeAttribute(attr);
    }
    if (local) {
      img.setAttribute("src", local.url);
      if (local.width && local.height) {
        img.setAttribute("width", String(local.width));
        img.setAttribute("height", String(local.height));
      }
    }
  }

  // Strip WordPress classes, inline styles and data-* attributes.
  for (const el of root.querySelectorAll("*") as HTMLElement[]) {
    for (const attr of Object.keys(el.attributes)) {
      if (attr === "class" || attr === "style" || attr.startsWith("data-")) el.removeAttribute(attr);
    }
    if (el.tagName === "A") {
      const href = el.getAttribute("href") ?? "";
      if (href.startsWith(SOURCE)) el.setAttribute("href", href.slice(SOURCE.length) || "/");
    }
  }

  const clean = sanitizeContent(root.toString());
  // One block element per line keeps the stored HTML readable in the editor.
  return clean
    .replace(/(<\/(?:p|h[2-6]|ul|ol|table|blockquote|figure|pre|div)>|<hr\s*\/?>|<img[^>]*>)\s*(?=<(?:p|h[2-6]|ul|ol|table|blockquote|figure|pre|div|hr|img)\b)/g, "$1\n")
    .replace(/<\/li>\s*<li>/g, "</li>\n<li>");
}

async function main() {
  console.log(`Importing from ${SOURCE}`);

  const [wpPosts, wpTags, wpUsers, wpMedia] = await Promise.all([
    getJson<WpPost>("posts?status=publish"),
    getJson<WpTerm>("tags"),
    getJson<WpUser>("users"),
    getJson<WpMedia>("media"),
  ]);
  console.log(`Found ${wpPosts.length} posts, ${wpTags.length} tags, ${wpMedia.length} media items`);

  const mediaById = new Map(wpMedia.map((m) => [m.id, m]));
  const tagById = new Map(wpTags.map((t) => [t.id, t]));

  // Author profile (bio + photo from the WordPress user "jessica-harper").
  const wpAuthor = wpUsers.find((u) => u.slug === DEFAULT_AUTHOR.slug);
  const bio = stripHtml(wpAuthor?.description ?? "");
  const avatar = await downloadImage(`${SOURCE}/wp-content/uploads/2026/06/Jessica-Harper.webp`, DEFAULT_AUTHOR.name);

  // Every image in the media library (logos, illustrations, screenshots…).
  for (const item of wpMedia) {
    await downloadImage(item.source_url, decodeEntities(item.alt_text ?? ""));
  }

  const usedTagIds = new Set<number>();
  const posts = [];
  for (const wp of wpPosts) {
    console.log(`• ${wp.slug}`);
    const override = POST_OVERRIDES[wp.slug];
    const content = await cleanPostHtml(wp.content.rendered);
    const title = decodeEntities(wp.title.rendered);
    const featured = mediaById.get(wp.featured_media);
    const featuredLocal = featured
      ? await downloadImage(featured.source_url, decodeEntities(featured.alt_text || title))
      : null;
    const firstParagraph = stripHtml(/<p>([\s\S]*?)<\/p>/.exec(content)?.[1] ?? "");
    const description = override?.description ?? truncate(firstParagraph, 158);
    wp.tags.forEach((id) => usedTagIds.add(id));

    posts.push({
      title,
      slug: wp.slug,
      excerpt: description,
      content,
      featuredImage: featuredLocal?.url ?? "",
      featuredImageAlt: featuredLocal?.alt || title,
      status: "published" as const,
      publishedAt: `${wp.date_gmt}Z`,
      updatedAt: `${wp.modified_gmt}Z`,
      author: DEFAULT_AUTHOR.slug,
      category: override?.category ?? "guides",
      tags: wp.tags
        .map((id) => tagById.get(id)?.slug)
        .filter((slug): slug is string => Boolean(slug)),
      seoTitle: "",
      seoDescription: description,
    });
  }

  const data = {
    source: SOURCE,
    importedAt: new Date().toISOString(),
    authors: [
      {
        ...DEFAULT_AUTHOR,
        bio,
        avatar: avatar?.url ?? "",
      },
    ],
    categories: CATEGORIES,
    tags: wpTags
      .filter((t) => usedTagIds.has(t.id))
      .map((t) => ({ name: decodeEntities(t.name), slug: t.slug })),
    posts: posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    media: [...downloaded.values()].sort((a, b) => a.url.localeCompare(b.url)),
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`\nWrote ${path.relative(ROOT, OUT_FILE)} (${posts.length} posts, ${data.media.length} images)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
