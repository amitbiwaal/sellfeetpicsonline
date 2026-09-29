import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PostCard } from "@/lib/data/content";
import { formatDate } from "@/lib/utils";
import { AuthorAvatar } from "./PostCard";

/** Large horizontal card for the newest article. */
export function FeaturedPost({ post }: { post: PostCard }) {
  const href = `/${post.slug}/`;
  return (
    <article className="sfo-card group grid grid-cols-1 overflow-hidden md:grid-cols-2">
      <Link href={href} className="relative block aspect-[3/2] overflow-hidden bg-blush md:aspect-auto md:min-h-[340px]" tabIndex={-1} aria-hidden="true">
        {post.featuredImage && (
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 768px) 560px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </Link>
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11.5px] font-bold tracking-[0.12em] uppercase">
          <span className="rounded-full bg-gradient-brand px-2.5 py-1 text-white">Latest</span>
          {post.category && (
            <Link href={`/category/${post.category.slug}/`} className="text-brand hover:text-brand-dark">
              {post.category.name}
            </Link>
          )}
        </div>
        <h2 className="font-serif text-[26px] leading-tight font-semibold text-ink sm:text-[32px]">
          <Link href={href} className="transition-colors hover:text-brand">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="mt-3 text-base leading-relaxed text-muted">{post.excerpt}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[13px] text-subtle">
            {post.author && (
              <>
                <AuthorAvatar src={post.author.avatar} name={post.author.name} size={32} />
                <span className="font-semibold text-muted-2">{post.author.name}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            {post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>}
          </div>
          <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark">
            Read article <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
