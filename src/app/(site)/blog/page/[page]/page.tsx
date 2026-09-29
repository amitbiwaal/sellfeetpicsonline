import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BlogListing } from "@/components/blog/BlogListing";
import { POSTS_PER_PAGE, countPublishedPosts } from "@/lib/data/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

type Props = { params: Promise<{ page: string }> };

function parsePage(value: string) {
  return /^\d+$/.test(value) ? Number(value) : NaN;
}

export async function generateStaticParams() {
  const total = await countPublishedPosts();
  const pages = Math.ceil(total / POSTS_PER_PAGE);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = parsePage((await params).page);
  return pageMetadata({
    title: `Blog – Page ${page}`,
    description: `Guides, platform reviews and safety tips for selling feet pics online (page ${page}).`,
    path: `/blog/page/${page}/`,
  });
}

export default async function BlogPaginatedPage({ params }: Props) {
  const page = parsePage((await params).page);
  if (!Number.isInteger(page) || page < 1) notFound();
  if (page === 1) permanentRedirect("/blog/");
  return <BlogListing page={page} />;
}
