import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  ExternalLink,
  Eye,
  Percent,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";
import { getPublishedPlatforms } from "@/lib/data/content";
import type { Platform } from "@/lib/db/schema";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Best Platforms to Sell Feet Pics in 2026 (Ranked)",
  description:
    "Our 2026 ranking of the best sites to sell feet pics, compared by buyer traffic, seller fees, commission, payout reliability and privacy.",
  path: "/best-platforms/",
});

const CRITERIA = [
  { icon: Users, title: "Buyer traffic", text: "How many real buyers are actively shopping on the platform." },
  { icon: TrendingUp, title: "Ease of getting sales", text: "Whether new sellers get discovered without an existing audience." },
  { icon: Receipt, title: "Seller fees", text: "Subscriptions and upfront costs you pay before earning anything." },
  { icon: Percent, title: "Commission structure", text: "How much of each sale the platform keeps, and how it scales." },
  { icon: Banknote, title: "Payout reliability", text: "How consistently and quickly sellers actually get paid." },
  { icon: ShieldCheck, title: "Privacy & verification", text: "Age checks, identity protection and in-platform payments." },
  { icon: BadgeCheck, title: "Long-term reputation", text: "Track record, stability and honest creator feedback over time." },
];

function PlatformLinks({ platform, size = "default" }: { platform: Platform; size?: "default" | "sm" }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {platform.reviewUrl && (
        <Link href={platform.reviewUrl} className={cn("btn btn-primary", size === "sm" && "btn-sm")}>
          Read review <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
      {platform.websiteUrl && (
        <a
          href={platform.websiteUrl}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className={cn("btn btn-secondary", size === "sm" && "btn-sm")}
        >
          Visit {platform.name} <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-blush/70 px-3.5 py-2.5">
      <dt className="text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm leading-snug font-semibold text-ink">{value}</dd>
    </div>
  );
}

function ScorePill({ score }: { score: number | null }) {
  if (score == null) return null;
  return (
    <span className="inline-flex items-baseline gap-0.5 rounded-full bg-gradient-brand px-3 py-1 font-serif text-lg font-bold text-white">
      {score.toFixed(1)}
      <span className="text-xs font-semibold text-white/80">/10</span>
    </span>
  );
}

export default async function BestPlatformsPage() {
  const platforms = await getPublishedPlatforms();
  const top = platforms.find((p) => p.isTopPick) ?? platforms[0];

  return (
    <>
      <PageHero
        badge="Vetted platforms"
        title={
          <>
            Best Platforms to Sell Feet Pics <em>in 2026</em>
          </>
        }
        subtitle="We compared the most popular sites by buyer traffic, fees, commission, payout reliability and privacy. Here's where we'd start — and why."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Best Platforms", path: "/best-platforms/" },
        ]}
        image={{
          src: "/wp-content/uploads/2026/06/bggbfg.webp",
          alt: "Earn money from home illustration with a phone showing growing earnings",
          width: 1681,
          height: 935,
        }}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#top-pick" className="btn btn-primary">
            See our top pick <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="#comparison" className="btn btn-secondary">
            Compare all
          </Link>
        </div>
      </PageHero>

      {top && (
        <section id="top-pick" className="py-14 md:py-20">
          <Container>
            <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#e6116b,#ff9dc0)] p-[2px] shadow-pink">
              <div className="grid grid-cols-1 gap-8 rounded-[26px] bg-white p-6 sm:p-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-3.5 py-1.5 text-xs font-bold tracking-[0.1em] text-white uppercase">
                    <Trophy className="size-4" aria-hidden="true" /> Our top pick for 2026
                  </span>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <h2 className="font-serif text-4xl font-semibold text-ink md:text-5xl">{top.name}</h2>
                    <ScorePill score={top.score} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Stars rating={top.rating} size={18} />
                    <span className="text-sm font-bold text-ink">{top.rating.toFixed(1)} / 5</span>
                  </div>
                  <p className="mt-5 text-[17px] leading-relaxed text-muted">{top.summary}</p>
                  <div className="mt-7">
                    <PlatformLinks platform={top} />
                  </div>
                </div>
                <dl className="grid grid-cols-2 content-start gap-2.5 sm:gap-3 lg:grid-cols-1">
                  <Fact label="Best for" value={top.bestFor} />
                  <Fact label="Seller cost" value={top.sellerCost} />
                  <Fact label="Commission" value={top.commission} />
                  <Fact label="Buyer traffic" value={top.buyerTraffic} />
                  <Fact label="Payout speed" value={top.payoutSpeed} />
                </dl>
              </div>
            </div>
          </Container>
        </section>
      )}

      <section id="comparison" className="bg-blush-3 py-14 md:py-20">
        <Container>
          <SectionHeading
            badge="Quick comparison"
            title={
              <>
                Every platform, <em>side by side</em>
              </>
            }
            subtitle="Fees and rules change often. We check each platform against its official terms, but always confirm on the platform before you sign up."
          />
          {/* Phones and tablets: compact list. The full details are in the ranking below. */}
          <ol className="mt-8 divide-y divide-[#f6e7ee] overflow-hidden rounded-2xl border border-line-2 bg-white lg:hidden">
            {platforms.map((p, i) => (
              <li key={p.id}>
                <a href={`#platform-${p.slug}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-blush">
                  <span className="flex size-8 flex-none items-center justify-center rounded-xl bg-blush-soft font-serif text-sm font-bold text-brand">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 font-semibold text-ink">
                      {p.name}
                      {p.isTopPick && (
                        <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                          Top pick
                        </span>
                      )}
                    </span>
                    {p.bestFor && <span className="block truncate text-[13px] text-subtle">{p.bestFor}</span>}
                  </span>
                  <span className="flex-none text-sm font-bold text-ink">
                    {p.score != null ? (
                      <>
                        {p.score.toFixed(1)}
                        <span className="text-xs font-semibold text-subtle">/10</span>
                      </>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ol>

          <div className="relative mt-10 hidden overflow-x-auto rounded-2xl border border-line-2 bg-white lg:block">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-blush text-ink">
                <tr>
                  <th scope="col" className="px-4 py-3.5 font-bold whitespace-nowrap">#</th>
                  <th scope="col" className="px-4 py-3.5 font-bold whitespace-nowrap">Platform</th>
                  <th scope="col" className="px-4 py-3.5 font-bold whitespace-nowrap">Our score</th>
                  <th scope="col" className="px-4 py-3.5 font-bold whitespace-nowrap">Best for</th>
                  <th scope="col" className="px-4 py-3.5 font-bold whitespace-nowrap">Seller cost</th>
                  <th scope="col" className="px-4 py-3.5 font-bold whitespace-nowrap">Commission</th>
                  <th scope="col" className="px-4 py-3.5 font-bold whitespace-nowrap">Buyer traffic</th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((p, i) => (
                  <tr key={p.id} className="border-t border-[#f6e7ee] even:bg-[#fffafc]">
                    <td className="px-4 py-3.5 font-serif text-base font-bold text-brand">{i + 1}</td>
                    <th scope="row" className="px-4 py-3.5 font-semibold text-ink">
                      <a href={`#platform-${p.slug}`} className="hover:text-brand">
                        {p.name}
                      </a>
                      {p.isTopPick && (
                        <span className="ml-2 inline-block rounded-full bg-blush-soft px-2 py-0.5 text-[10.5px] font-bold whitespace-nowrap text-brand uppercase">
                          Top pick
                        </span>
                      )}
                    </th>
                    <td className="px-4 py-3.5 font-semibold text-ink">{p.score != null ? `${p.score.toFixed(1)}/10` : "—"}</td>
                    <td className="px-4 py-3.5 text-body">{p.bestFor || "—"}</td>
                    <td className="px-4 py-3.5 text-body">{p.sellerCost || "—"}</td>
                    <td className="px-4 py-3.5 text-body">{p.commission || "—"}</td>
                    <td className="px-4 py-3.5 text-body">{p.buyerTraffic || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container size="narrow" className="max-w-4xl">
          <SectionHeading
            badge="The ranking"
            title={
              <>
                Our platform <em>reviews</em>, in order
              </>
            }
            subtitle="Short, honest summaries. Follow the links for the full reviews and comparisons."
          />
          <ol className="mt-12 space-y-6">
            {platforms.map((p, i) => (
              <li key={p.id} id={`platform-${p.slug}`} className="sfo-card scroll-mt-28 p-5 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span className="flex size-11 flex-none items-center justify-center rounded-2xl bg-gradient-brand font-serif text-lg font-bold text-white shadow-[0_8px_18px_rgba(230,17,107,0.28)] sm:size-12 sm:text-xl">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-serif text-[22px] font-semibold text-ink sm:text-2xl">{p.name}</h3>
                      {p.bestFor && <p className="text-sm font-medium text-subtle">Best for: {p.bestFor}</p>}
                    </div>
                  </div>
                  <ScorePill score={p.score} />
                </div>
                {p.summary && <p className="mt-4 text-[15.5px] leading-relaxed text-muted sm:mt-5">{p.summary}</p>}
                <dl className="mt-5 grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
                  <Fact label="Seller cost" value={p.sellerCost} />
                  <Fact label="Commission" value={p.commission} />
                  <Fact label="Buyer traffic" value={p.buyerTraffic} />
                  <Fact label="Payout speed" value={p.payoutSpeed} />
                </dl>
                <div className="mt-6">
                  <PlatformLinks platform={p} size="sm" />
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-[linear-gradient(180deg,#fff7fb_0%,#fff_100%)] py-14 md:py-20">
        <Container>
          <SectionHeading
            badge="Our method"
            title={
              <>
                How we <em>rate</em> platforms
              </>
            }
            subtitle="Every platform is scored against the same seven criteria, verified against its official terms."
          />
          <div className="stagger mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CRITERIA.map(({ icon: Icon, title, text }) => (
              <div key={title} className="sfo-card p-6">
                <div className="sfo-icon mb-4 size-12 rounded-[14px]">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
            <div className="flex flex-col justify-center rounded-[20px] border border-dashed border-brand-light bg-blush p-6">
              <Eye className="size-6 text-brand" aria-hidden="true" />
              <p className="mt-3 text-sm leading-relaxed text-muted-2">
                Want the full details? Read our in-depth comparison of 13 platforms.
              </p>
              <Link
                href="/best-places-to-sell-feet-pics-online/"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark"
              >
                Read the comparison <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-[12.5px] leading-relaxed text-[#999]">
            Ratings and details are based on our own research and may change over time. Some links on this page may be
            affiliate links; this never changes our rankings. See our{" "}
            <Link href="/affiliate-disclosure/" className="underline underline-offset-2 hover:text-brand">
              affiliate disclosure
            </Link>{" "}
            and{" "}
            <Link href="/editorial-policy/" className="underline underline-offset-2 hover:text-brand">
              editorial policy
            </Link>
            .
          </p>
        </Container>
      </section>

      <CtaBand
        title="Picked a platform? Protect yourself first"
        text="Before your first upload, run through our privacy and safety checklist. It takes ten minutes."
        buttonLabel="Read the safety tips"
        href="/safety-tips/"
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Best platforms to sell feet pics in 2026",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: platforms.length,
          itemListElement: platforms.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: absoluteUrl(`/best-platforms/#platform-${p.slug}`),
          })),
        }}
      />
    </>
  );
}
