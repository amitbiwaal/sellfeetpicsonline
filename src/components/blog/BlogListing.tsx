import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/Container";
import { Pagination } from "@/components/ui/Pagination";
import {
  POSTS_PER_PAGE,
  countPublishedPosts,
  getCategoriesWithCounts,
  getPublishedPosts,
} from "@/lib/data/content";
import { cn } from "@/lib/utils";
import { FeaturedPost } from "./FeaturedPost";
import { PostGrid } from "./PostCard";

export function SearchForm({ defaultValue = "", className }: { defaultValue?: string; className?: string }) {
  return (
    <form action="/search/" method="get" role="search" className={cn("relative mx-auto w-full max-w-lg", className)}>
      <label htmlFor="blog-search" className="sr-only">
        Search articles
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
      <input
        id="blog-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search articles…"
        className="h-13 w-full rounded-full border border-line bg-white pr-28 pl-12 text-[15px] text-ink shadow-[0_10px_30px_-18px_rgba(168,21,78,0.35)] outline-none placeholder:text-subtle focus:border-brand-light focus:ring-4 focus:ring-blush-soft"
      />
      <button type="submit" className="btn btn-primary btn-sm absolute top-1/2 right-1.5 -translate-y-1/2">
        Search
      </button>
    </form>
  );
}

export async function BlogListing({ page }: { page: number }) {
  const [total, categories] = await Promise.all([countPublishedPosts(), getCategoriesWithCounts()]);
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  if (page > totalPages) notFound();

  const posts = await getPublishedPosts({ limit: POSTS_PER_PAGE, offset: (page - 1) * POSTS_PER_PAGE });
  const [featured, ...rest] = page === 1 ? posts : [null, ...posts];

  return (
    <>
      <PageHero
        badge="Blog"
        title={
          <>
            Guides, reviews &amp; <em>safety tips</em>
          </>
        }
        subtitle="Everything you need to start selling feet pics online: honest platform reviews, step-by-step guides and privacy advice that works."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog/" },
        ]}
      >
        <SearchForm className="mt-8" />
        <nav aria-label="Categories" className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/blog/" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            All articles
          </Link>
          {categories
            .filter((c) => c.postCount > 0)
            .map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}/`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-muted-2 transition-colors hover:border-brand-light hover:text-brand"
              >
                {category.name} <span className="text-subtle">({category.postCount})</span>
              </Link>
            ))}
        </nav>
      </PageHero>

      <Container className="py-12 md:py-16">
        {total === 0 ? (
          <p className="py-16 text-center text-lg text-muted">No articles yet. Check back soon!</p>
        ) : (
          <>
            {featured && <FeaturedPost post={featured} />}
            {rest.length > 0 && (
              <div className={cn(featured && "mt-10")}>
                <PostGrid posts={rest.filter((p): p is NonNullable<typeof p> => Boolean(p))} />
              </div>
            )}
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefFor={(p) => (p === 1 ? "/blog/" : `/blog/page/${p}/`)}
            />
          </>
        )}
      </Container>

      <CtaBand
        title="Not sure where to start?"
        text="Compare the platforms we trust and pick the right one for you in minutes."
        buttonLabel="Compare platforms"
        href="/best-platforms/"
      />
    </>
  );
}
