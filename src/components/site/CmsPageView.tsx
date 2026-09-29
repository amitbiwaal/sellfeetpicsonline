import Link from "next/link";
import { TableScrollHints } from "@/components/blog/TableScrollHints";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { prepareContent } from "@/lib/content/html";
import { getFooterPages } from "@/lib/data/content";
import { getSettings } from "@/lib/data/settings";
import type { Page } from "@/lib/db/schema";
import { contentTokens } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { cn, formatDate } from "@/lib/utils";

export async function CmsPageView({ page }: { page: Page }) {
  const [settings, footerPages] = await Promise.all([getSettings(), getFooterPages()]);
  const { html } = prepareContent(page.content, { siteUrl: SITE_URL, tokens: contentTokens(settings, SITE_URL) });
  const related = footerPages.filter((p) => p.slug !== page.slug);

  return (
    <article>
      <header className="border-b border-line bg-[linear-gradient(180deg,#fff5f8_0%,#ffffff_100%)]">
        <Container size="narrow" className="pt-6 pb-12 md:pb-14">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: page.title, path: `/${page.slug}/` }]} />
          <div className="mt-10 text-center">
            <h1 className="sfo-h1 text-balance">{page.title}</h1>
            {page.intro && <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">{page.intro}</p>}
            <p className="mt-5 text-sm text-subtle">
              Last updated: <time dateTime={page.updatedAt.toISOString()}>{formatDate(page.updatedAt)}</time>
            </p>
          </div>
        </Container>
      </header>

      <Container size="narrow" className="py-12 md:py-16">
        <div className="prose-sfo" dangerouslySetInnerHTML={{ __html: html }} />
        <TableScrollHints />
      </Container>

      {page.showInFooter && related.length > 0 && (
        <Container size="narrow" className="pb-16 md:pb-20">
          <div className="rounded-3xl border border-line bg-blush-3 p-6 sm:p-8">
            <h2 className="font-serif text-xl font-semibold text-ink">Related policies</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}/`}
                    className={cn(
                      "inline-block rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-muted-2",
                      "transition-colors hover:border-brand-light hover:text-brand",
                    )}
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      )}
    </article>
  );
}
