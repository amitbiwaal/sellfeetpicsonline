import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import { Container } from "@/components/ui/Container";
import type { PostCard as PostCardData } from "@/lib/data/content";

export function LatestArticles({ posts }: { posts: PostCardData[] }) {
  if (!posts.length) return null;
  return (
    <section id="articles" className="py-14 md:py-20">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <span className="sfo-badge-outline">Latest articles</span>
          <h2 className="mt-5 font-serif text-[29px] leading-[1.08] font-semibold tracking-[-0.02em] text-balance text-ink md:text-[37px] lg:text-[46px]">
            Learn to start, stay safe, and grow
          </h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-muted">
            Practical reads for every step — from your first photo to your first thousand.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            // Two columns on tablets: hide the third card so no card sits alone on a row.
            <PostCard key={post.id} post={post} className={index === 2 ? "sm:max-lg:hidden" : undefined} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/blog/" className="btn btn-secondary">
            View all articles <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
