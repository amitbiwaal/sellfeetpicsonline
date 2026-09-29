import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/blog/PostCard";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/Container";
import { getCategoriesWithCounts, getCategoryBySlug, getPublishedPosts } from "@/lib/data/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getCategoriesWithCounts();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) return { title: "Category not found", robots: { index: false } };
  return pageMetadata({
    title: `${category.name}: Articles & Guides`,
    description:
      category.description ||
      `All ${category.name.toLowerCase()} articles from SellFeetOnline to help you sell feet pics online safely.`,
    path: `/category/${category.slug}/`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) notFound();
  const posts = await getPublishedPosts({ categoryId: category.id, limit: 60 });

  return (
    <>
      <PageHero
        badge="Category"
        title={category.name}
        subtitle={category.description || undefined}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog/" },
          { name: category.name, path: `/category/${category.slug}/` },
        ]}
      >
        <p className="mt-4 text-sm font-semibold text-subtle">
          {posts.length} {posts.length === 1 ? "article" : "articles"}
        </p>
      </PageHero>
      <Container className="py-12 md:py-16">
        {posts.length ? (
          <PostGrid posts={posts} priorityCount={3} />
        ) : (
          <p className="py-12 text-center text-lg text-muted">No articles in this category yet.</p>
        )}
      </Container>
      <CtaBand />
    </>
  );
}
