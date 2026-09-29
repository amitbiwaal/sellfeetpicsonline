import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { AuthorAvatar } from "@/components/blog/PostCard";
import { CtaBand } from "@/components/site/CtaBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getLeadAuthor } from "@/lib/data/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "SellFeetOnline helps first-timers sell feet pictures online safely: honest platform reviews, privacy-first guides and advice we'd follow ourselves.",
  path: "/about/",
});

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Privacy first",
    text: "Your identity stays yours. We show you how to stay anonymous and protect every upload and payout.",
  },
  {
    icon: BadgeCheck,
    title: "Honest advice",
    text: "We only recommend platforms and tactics we've actually tested — no paid hype, no empty promises.",
  },
  {
    icon: GraduationCap,
    title: "Beginner friendly",
    text: "Step-by-step from your first photo to your first payout — written for people starting from zero.",
  },
];

const CRITERIA = [
  "Buyer traffic",
  "Ease of getting sales",
  "Seller fees",
  "Commission structure",
  "Payout reliability",
  "Privacy & verification",
  "Long-term reputation",
];

export default async function AboutPage() {
  const author = await getLeadAuthor();

  return (
    <>
      <section className="bg-[linear-gradient(180deg,#fff5f8_0%,#ffffff_100%)]">
        <Container className="pt-6 pb-16 md:pb-20">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "About", path: "/about/" },
            ]}
          />
          <div className="mt-10 grid grid-cols-1 items-center gap-10 md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <Image
              src="/wp-content/uploads/2026/06/vgdfgd.webp"
              alt="Illustration of a phone showing growing earnings next to a camera, coins and a privacy shield"
              width={1254}
              height={1254}
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 460px, 100vw"
              className="mx-auto w-full max-w-[520px] rounded-[22px] shadow-[0_30px_70px_-38px_rgba(168,21,78,0.45)]"
            />
            <div>
              <span className="sfo-badge-outline">About us</span>
              <h1 className="mt-5 font-serif text-[clamp(2rem,4.5vw,3rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-ink">
                Helping beginners earn <em className="text-brand italic">safely</em>
              </h1>
              <p className="mt-5 text-[17px] leading-[1.8] text-muted-2">
                SellFeetOnline started with one simple goal: make it easy for first-timers to sell feet pictures online
                without the guesswork, the scams, or the privacy risks.
              </p>
              <p className="mt-4 text-[17px] leading-[1.8] text-muted-2">
                We test the platforms, write the honest guides, and share only the advice we&apos;d follow ourselves — so
                you can start with confidence and keep your identity protected from day one.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Container className="pb-16 md:pb-20">
        <div className="rounded-[26px] border border-line bg-[linear-gradient(150deg,#fff5f8,#ffe6ef)] px-6 py-10 text-center sm:px-12 sm:py-12">
          <span className="text-xs font-bold tracking-[0.16em] text-brand uppercase">Our mission</span>
          <h2 className="mx-auto mt-3.5 max-w-[620px] font-serif text-[clamp(1.6rem,3.5vw,2.4rem)] leading-[1.2] font-semibold tracking-[-0.02em] text-ink">
            Make safe earning simple, private, and within reach for everyone
          </h2>
          <p className="mx-auto mt-3.5 max-w-[560px] text-[16.5px] leading-[1.8] text-muted-2">
            No confusing jargon, no risky shortcuts. Just clear steps and trusted tools that put you in control of your
            income and your privacy.
          </p>
        </div>

        <h2 className="mt-16 mb-9 text-center font-serif text-[clamp(1.5rem,3vw,2rem)] leading-[1.2] font-semibold tracking-[-0.02em] text-ink">
          What we stand for
        </h2>
        <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="sfo-card rounded-[18px] border-line p-7">
              <div className="sfo-icon mb-[18px] size-[52px] rounded-[14px] bg-blush text-brand">
                <Icon className="size-[26px]" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-[1.3rem] font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-muted-2">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {author && (
            <section className="rounded-[26px] border border-line bg-white p-7 sm:p-9">
              <span className="text-xs font-bold tracking-[0.16em] text-brand uppercase">Meet the author</span>
              <div className="mt-5 flex items-center gap-4">
                <AuthorAvatar src={author.avatar} name={author.name} size={72} />
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-ink">{author.name}</h2>
                  {author.jobTitle && <p className="text-sm text-subtle">{author.jobTitle}</p>}
                </div>
              </div>
              {author.bio && <p className="mt-5 text-[15.5px] leading-relaxed text-muted">{author.bio}</p>}
              <Link
                href={`/author/${author.slug}/`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark"
              >
                Read {author.name.split(" ")[0]}&apos;s articles <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </section>
          )}
          <section className="rounded-[26px] border border-line bg-white p-7 sm:p-9">
            <span className="text-xs font-bold tracking-[0.16em] text-brand uppercase">How we review platforms</span>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-ink">The same seven checks, every time</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
              We verify every fee, commission rate and seller policy against each platform&apos;s official terms, then
              score them on:
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CRITERIA.map((c) => (
                <li key={c} className="rounded-full bg-blush px-3.5 py-1.5 text-[13px] font-semibold text-muted-2">
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
              <Link href="/editorial-policy/" className="inline-flex items-center gap-1.5 text-brand hover:text-brand-dark">
                Editorial policy <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/best-platforms/" className="inline-flex items-center gap-1.5 text-brand hover:text-brand-dark">
                See our rankings <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </Container>

      <CtaBand
        title="Start your first listing with confidence"
        text="Follow our step-by-step guide and choose a platform we've vetted for safety and payouts."
        buttonLabel="Get started"
        href="/#start"
      />
    </>
  );
}
