import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import type { Author } from "@/lib/db/schema";
import { AuthorAvatar } from "./PostCard";

export function AuthorBox({ author }: { author: Author }) {
  return (
    <section
      aria-label="About the author"
      className="mt-12 flex flex-col gap-5 rounded-3xl border border-line bg-[linear-gradient(150deg,#fff5f8,#ffffff)] p-6 sm:flex-row sm:p-8"
    >
      <AuthorAvatar src={author.avatar} name={author.name} size={84} />
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-[0.14em] text-brand uppercase">Written by</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
          <Link href={`/author/${author.slug}/`} className="hover:text-brand">
            {author.name}
          </Link>
        </h2>
        {author.jobTitle && <p className="text-sm font-medium text-subtle">{author.jobTitle}</p>}
        {author.bio && <p className="mt-3 text-[15px] leading-relaxed text-muted">{author.bio}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link href={`/author/${author.slug}/`} className="inline-flex items-center gap-1.5 text-brand hover:text-brand-dark">
            See all posts by {author.name.split(" ")[0]} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          {author.website && (
            <a href={author.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-brand">
              <Globe className="size-4" aria-hidden="true" /> Website
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
