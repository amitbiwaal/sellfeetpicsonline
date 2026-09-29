import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { PostView } from "@/components/blog/PostView";
import { CmsPageView } from "@/components/site/CmsPageView";
import {
  getImageSize,
  getPageBySlug,
  getPagesForSitemap,
  getPostBySlug,
  getPostSlugsForSitemap,
} from "@/lib/data/content";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { stripHtml, truncate } from "@/lib/utils";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

async function resolveSlug(slug: string) {
  const { isEnabled: preview } = await draftMode();
  const post = await getPostBySlug(slug, preview);
  if (post) return { type: "post" as const, post, preview };
  const page = await getPageBySlug(slug, preview);
  if (page) return { type: "page" as const, page, preview };
  return null;
}

export async function generateStaticParams() {
  const [postRows, pageRows] = await Promise.all([getPostSlugsForSitemap(), getPagesForSitemap()]);
  return [...postRows, ...pageRows].map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await resolveSlug(slug);
  if (!found) return { title: "Page not found", robots: { index: false, follow: true } };

  if (found.type === "post") {
    const { post } = found;
    const size = await getImageSize(post.featuredImage);
    return pageMetadata({
      title: post.seoTitle || post.title,
      absoluteTitle: Boolean(post.seoTitle),
      description: post.seoDescription || post.excerpt || truncate(stripHtml(post.content), 155),
      path: `/${post.slug}/`,
      type: "article",
      image: post.featuredImage
        ? { url: post.featuredImage, width: size?.width, height: size?.height, alt: post.featuredImageAlt }
        : null,
      noindex: post.noindex || post.status !== "published",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [absoluteUrl(`/author/${post.author.slug}/`)] : undefined,
      section: post.category?.name,
      tags: post.tags.map((t) => t.name),
    });
  }

  const { page } = found;
  return pageMetadata({
    title: page.seoTitle || page.title,
    absoluteTitle: Boolean(page.seoTitle),
    description: page.seoDescription || page.intro || truncate(stripHtml(page.content), 155),
    path: `/${page.slug}/`,
    noindex: page.noindex || page.status !== "published",
  });
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const found = await resolveSlug(slug);
  if (!found) notFound();
  return found.type === "post" ? <PostView post={found.post} /> : <CmsPageView page={found.page} />;
}
