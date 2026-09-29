import Image from "next/image";
import Link from "next/link";
import type { PostCard as PostCardData } from "@/lib/data/content";
import { cn, formatDate } from "@/lib/utils";

export function AuthorAvatar({ src, name, size = 28 }: { src?: string; name: string; size?: number }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        sizes={`${size * 2}px`}
        className="shrink-0 rounded-full object-cover ring-2 ring-white"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-blush-soft font-semibold text-brand"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {name.charAt(0)}
    </span>
  );
}

export function PostCard({ post, priority, className }: { post: PostCardData; priority?: boolean; className?: string }) {
  const href = `/${post.slug}/`;
  return (
    <article className={cn("sfo-card group flex flex-col", className)}>
      <Link href={href} className="relative block aspect-[3/2] overflow-hidden bg-blush" tabIndex={-1} aria-hidden="true">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            fill
            loading={priority ? "eager" : undefined}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-serif text-4xl text-brand/30">SFO</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {post.category && (
          <Link
            href={`/category/${post.category.slug}/`}
            className="mb-2.5 self-start text-[11.5px] font-bold tracking-[0.12em] text-brand uppercase hover:text-brand-dark"
          >
            {post.category.name}
          </Link>
        )}
        <h3 className="font-serif text-[21px] leading-snug font-semibold text-ink">
          <Link href={href} className="line-clamp-3 transition-colors hover:text-brand">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2.5 line-clamp-3 text-[15px] leading-relaxed text-muted">{post.excerpt}</p>}
        <div className="mt-auto flex items-center gap-2.5 pt-5 text-[13px] text-subtle">
          {post.author && (
            <>
              <AuthorAvatar src={post.author.avatar} name={post.author.name} />
              <Link href={`/author/${post.author.slug}/`} className="font-semibold text-muted-2 hover:text-brand">
                {post.author.name}
              </Link>
              <span aria-hidden="true">·</span>
            </>
          )}
          {post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>}
        </div>
      </div>
    </article>
  );
}

export function PostGrid({ posts, priorityCount = 0 }: { posts: PostCardData[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} priority={index < priorityCount} />
      ))}
    </div>
  );
}
