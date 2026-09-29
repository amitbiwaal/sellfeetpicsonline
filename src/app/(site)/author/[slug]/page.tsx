import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import { AuthorAvatar, PostGrid } from "@/components/blog/PostCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { getAuthorBySlug, getAuthorsWithPosts, getPublishedPosts } from "@/lib/data/content";
import { pageMetadata, personJsonLd } from "@/lib/seo";
import { truncate } from "@/lib/utils";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const authors = await getAuthorsWithPosts();
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthorBySlug((await params).slug);
  if (!author) return { title: "Author not found", robots: { index: false } };
  return pageMetadata({
    title: `${author.name}${author.jobTitle ? `, ${author.jobTitle}` : ""}`,
    description: truncate(author.bio || `Articles written by ${author.name} for SellFeetOnline.`, 158),
    path: `/author/${author.slug}/`,
    type: "profile",
    image: author.avatar ? { url: author.avatar, alt: author.name } : null,
  });
}

export default async function AuthorPage({ params }: Props) {
  const author = await getAuthorBySlug((await params).slug);
  if (!author) notFound();
  const posts = await getPublishedPosts({ authorId: author.id, limit: 60 });
  const socials = [
    { label: "Website", href: author.website },
    { label: "X (Twitter)", href: author.twitter },
    { label: "Instagram", href: author.instagram },
    { label: "LinkedIn", href: author.linkedin },
  ].filter((s) => s.href);

  return (
    <>
      <section className="border-b border-line/70 bg-[linear-gradient(180deg,#fff5f8_0%,#ffffff_100%)]">
        <Container className="pt-6 pb-12 md:pb-16">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Authors", path: "/about/" },
              { name: author.name, path: `/author/${author.slug}/` },
            ]}
          />
          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center text-center">
            <AuthorAvatar src={author.avatar} name={author.name} size={128} />
            <p className="mt-6 text-xs font-bold tracking-[0.16em] text-brand uppercase">Author</p>
            <h1 className="sfo-h1 mt-2">{author.name}</h1>
            {author.jobTitle && <p className="mt-2 font-medium text-subtle">{author.jobTitle}</p>}
            {author.bio && <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">{author.bio}</p>}
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap justify-center gap-2">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-muted-2 hover:border-brand-light hover:text-brand"
                    >
                      <Globe className="size-4" aria-hidden="true" /> {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <h2 className="mb-8 font-serif text-3xl font-semibold text-ink">
          Articles by {author.name} <span className="text-subtle">({posts.length})</span>
        </h2>
        {posts.length ? (
          <PostGrid posts={posts} priorityCount={3} />
        ) : (
          <p className="text-muted">No published articles yet.</p>
        )}
      </Container>

      <JsonLd
        data={personJsonLd({
          name: author.name,
          slug: author.slug,
          jobTitle: author.jobTitle,
          bio: author.bio,
          avatar: author.avatar,
          sameAs: socials.map((s) => s.href),
        })}
      />
    </>
  );
}
