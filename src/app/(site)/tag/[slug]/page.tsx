import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/blog/PostCard";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/Container";
import { getPublishedPosts, getTagBySlug } from "@/lib/data/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTagBySlug((await params).slug);
  if (!tag) return { title: "Tag not found", robots: { index: false } };
  // Tag archives are thin pages: keep them out of search results but let crawlers follow links.
  return pageMetadata({
    title: `Articles tagged “${tag.name}”`,
    description: `SellFeetOnline articles about ${tag.name}.`,
    path: `/tag/${tag.slug}/`,
    noindex: true,
  });
}

export default async function TagPage({ params }: Props) {
  const tag = await getTagBySlug((await params).slug);
  if (!tag) notFound();
  const posts = await getPublishedPosts({ tagId: tag.id, limit: 60 });

  return (
    <>
      <PageHero
        badge="Tag"
        title={<span className="capitalize">{tag.name}</span>}
        subtitle={`${posts.length} ${posts.length === 1 ? "article" : "articles"} tagged “${tag.name}”.`}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog/" },
          { name: tag.name, path: `/tag/${tag.slug}/` },
        ]}
      />
      <Container className="py-12 md:py-16">
        {posts.length ? (
          <PostGrid posts={posts} priorityCount={3} />
        ) : (
          <p className="py-12 text-center text-lg text-muted">No articles with this tag yet.</p>
        )}
      </Container>
    </>
  );
}
