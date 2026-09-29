import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Tag } from "lucide-react";
import { CtaBand } from "@/components/site/CtaBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { prepareContent } from "@/lib/content/html";
import { getImageSize, getRelatedPosts, type FullPost } from "@/lib/data/content";
import { getSettings } from "@/lib/data/settings";
import { articleJsonLd } from "@/lib/seo";
import { contentTokens } from "@/lib/settings";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { countWords, formatDate, readingMinutes } from "@/lib/utils";
import { AffiliateNote } from "./AffiliateNote";
import { AuthorBox } from "./AuthorBox";
import { AuthorAvatar, PostGrid } from "./PostCard";
import { ShareButtons } from "./ShareButtons";
import { TableScrollHints } from "./TableScrollHints";
import { TocInline, TocSidebar } from "./TableOfContents";

const DAY = 24 * 60 * 60 * 1000;

export async function PostView({ post }: { post: FullPost }) {
  const [settings, related, imageSize] = await Promise.all([
    getSettings(),
    getRelatedPosts(post, 3),
    getImageSize(post.featuredImage),
  ]);
  const { html, toc } = prepareContent(post.content, {
    siteUrl: SITE_URL,
    tokens: contentTokens(settings, SITE_URL),
  });
  const minutes = readingMinutes(post.content);
  const published = post.publishedAt ?? post.createdAt;
  const wasUpdated = post.updatedAt.getTime() - published.getTime() > DAY;
  const url = absoluteUrl(`/${post.slug}/`);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog/" },
    ...(post.category ? [{ name: post.category.name, path: `/category/${post.category.slug}/` }] : []),
    { name: post.title, path: `/${post.slug}/` },
  ];

  return (
    <article>
      <header className="bg-[linear-gradient(180deg,#fff5f8_0%,#ffffff_100%)]">
        <Container className="pt-6 pb-10 md:pt-8 md:pb-12">
          <Breadcrumbs items={crumbs} />
          <div className="mx-auto mt-8 max-w-3xl text-center md:mt-10">
            {post.category && (
              <Link href={`/category/${post.category.slug}/`} className="sfo-badge-outline hover:border-brand-light">
                {post.category.name}
              </Link>
            )}
            <h1 className="mt-5 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.02em] text-balance text-ink sm:text-[44px] lg:text-[52px]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-lg">{post.excerpt}</p>
            )}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-subtle">
              {post.author && (
                <Link href={`/author/${post.author.slug}/`} className="flex items-center gap-2 font-semibold text-ink hover:text-brand">
                  <AuthorAvatar src={post.author.avatar} name={post.author.name} size={32} />
                  {post.author.name}
                </Link>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" />
                {wasUpdated ? (
                  <>
                    Updated <time dateTime={post.updatedAt.toISOString()}>{formatDate(post.updatedAt)}</time>
                  </>
                ) : (
                  <time dateTime={published.toISOString()}>{formatDate(published)}</time>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden="true" /> {minutes} min read
              </span>
            </div>
          </div>
        </Container>
      </header>

      {post.featuredImage && (
        <Container>
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[22px] border border-line bg-blush shadow-[0_30px_70px_-40px_rgba(168,21,78,0.45)] sm:rounded-[28px]">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              width={imageSize?.width ?? 1536}
              height={imageSize?.height ?? 1024}
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1080px) 1024px, 100vw"
              className="h-auto w-full"
            />
          </div>
        </Container>
      )}

      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_280px] xl:gap-16">
          <div className="min-w-0 lg:max-w-[760px]">
            <AffiliateNote />
            <TocInline items={toc} />
            <div className="prose-sfo" dangerouslySetInnerHTML={{ __html: html }} />
            <TableScrollHints />

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-line pt-6">
                <Tag className="size-4 text-brand" aria-hidden="true" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}/`}
                    className="rounded-full bg-blush px-3 py-1 text-[13px] font-medium text-muted-2 transition-colors hover:bg-blush-soft hover:text-brand"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-6">
              <ShareButtons url={url} title={post.title} />
            </div>

            {post.author && <AuthorBox author={post.author} />}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <TocSidebar items={toc} />
              <div className="rounded-2xl bg-[linear-gradient(150deg,#d81e66,#ff7aa8)] p-5 text-white">
                <p className="font-serif text-xl leading-snug font-semibold">New to selling feet pics?</p>
                <p className="mt-2 text-sm text-white/90">Start with the platforms our team has vetted for safety and payouts.</p>
                <Link href="/best-platforms/" className="btn btn-white btn-sm mt-4">
                  Compare platforms <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="border-t border-line bg-blush-3 py-14 md:py-20">
          <Container>
            <h2 className="mb-8 text-center font-serif text-[30px] font-semibold text-ink md:text-[38px]">
              Keep <span className="text-brand italic">reading</span>
            </h2>
            <PostGrid posts={related} />
          </Container>
        </section>
      )}

      <CtaBand
        title="Ready to start selling safely?"
        text="Compare the platforms we trust, then follow our step-by-step guide to your first sale."
        buttonLabel="See the best platforms"
        href="/best-platforms/"
      />

      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.seoDescription || post.excerpt,
          slug: post.slug,
          image: post.featuredImage,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          author: post.author,
          section: post.category?.name,
          keywords: post.tags.map((t) => t.name),
          wordCount: countWords(post.content),
        })}
      />
    </article>
  );
}
