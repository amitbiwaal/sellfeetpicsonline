import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm } from "@/components/blog/BlogListing";
import { PostGrid } from "@/components/blog/PostCard";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/Container";
import { searchPosts } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search/" },
};

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 100) ?? "";
  const results = query.length >= 2 ? await searchPosts(query) : [];

  return (
    <>
      <PageHero
        badge="Search"
        title={query ? <>Results for “{query}”</> : "Search the blog"}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Search", path: "/search/" },
        ]}
      >
        <SearchForm defaultValue={query} className="mt-8" />
      </PageHero>
      <Container className="py-12 md:py-16">
        {query.length < 2 ? (
          <p className="text-center text-muted">Type at least two characters to search our guides and reviews.</p>
        ) : results.length ? (
          <>
            <p className="mb-8 text-sm font-semibold text-subtle">
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
            <PostGrid posts={results} />
          </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-lg text-muted">No articles matched “{query}”.</p>
            <p className="mt-3 text-sm text-subtle">
              Try a different word, or browse{" "}
              <Link href="/blog/" className="font-semibold text-brand underline underline-offset-2">
                all articles
              </Link>
              .
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
