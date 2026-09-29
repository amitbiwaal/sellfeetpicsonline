import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FOUNDING_YEAR } from "@/lib/site";

function IncomeCard() {
  return (
    <div className="relative mx-auto w-full max-w-[360px] lg:mr-0 lg:ml-auto">
      <div aria-hidden="true" className="absolute -top-10 -right-8 size-44 rounded-full bg-brand-light/40 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-12 -left-10 size-48 rounded-full bg-brand-hot/15 blur-3xl" />
      <div className="relative rounded-[26px] border border-line bg-white p-[26px] shadow-pink-lg">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="text-[13px] text-subtle">Income overview</span>
          <span className="rounded-full bg-blush px-2.5 py-1 text-[11px] font-bold text-brand-dark">● Live</span>
        </div>
        <p className="font-serif text-5xl leading-none font-semibold tracking-[-0.03em] text-ink">
          <span className="align-super text-[26px] text-brand">$</span>1,250
          <span className="text-[19px] text-subtle">.00</span>
        </p>
        <p className="mt-2 text-sm font-semibold text-green-600">↗ +$350 this month</p>
        <svg viewBox="0 0 240 80" preserveAspectRatio="none" className="mt-[18px] h-[72px] w-full" aria-hidden="true">
          <defs>
            <linearGradient id="hero-income-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EC4A85" stopOpacity=".35" />
              <stop offset="100%" stopColor="#EC4A85" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 62 L40 54 L80 58 L120 36 L160 42 L200 20 L240 12 L240 80 L0 80 Z" fill="url(#hero-income-fill)" />
          <path
            d="M0 62 L40 54 L80 58 L120 36 L160 42 L200 20 L240 12"
            fill="none"
            stroke="#D81E66"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute -bottom-6 left-2 flex items-center gap-2.5 rounded-2xl border border-line bg-white px-4 py-3 shadow-pink-sm sm:-left-8">
        <span className="flex size-8 items-center justify-center rounded-full bg-blush-soft text-brand-hot">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <span className="text-[13px] leading-tight">
          <span className="block font-semibold text-ink">Privacy protected</span>
          <span className="text-subtle">Anonymous selling</span>
        </span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="overflow-x-clip bg-[linear-gradient(180deg,#fff5f8_0%,#ffffff_100%)]">
      <Container className="grid grid-cols-1 items-center gap-14 py-14 md:py-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-10 lg:py-24">
        <div className="animate-fade-up md:text-center lg:text-left">
          <span className="sfo-badge-outline">● Trusted by beginners since {FOUNDING_YEAR}</span>
          <h1 className="mt-6 font-serif text-[42px] leading-[1.02] font-semibold tracking-[-0.03em] text-balance text-ink sm:text-[54px] xl:text-[64px]">
            Sell Feet Online <span className="text-brand italic">safely</span> and Earn With Confidence
          </h1>
          <p className="mt-6 max-w-[560px] text-[17px] leading-[1.6] text-muted sm:text-lg md:mx-auto lg:mx-0">
            A clear, step by step path and a shortlist of platforms our team has actually vetted, so you can sell feet
            online with confidence and keep your privacy intact.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 md:justify-center lg:justify-start">
            <Link href="#start" className="btn btn-primary">
              Start now <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/best-platforms/" className="btn btn-secondary">
              Get started
            </Link>
          </div>
        </div>
        <IncomeCard />
      </Container>
    </section>
  );
}
