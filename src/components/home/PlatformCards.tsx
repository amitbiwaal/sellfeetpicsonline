import Link from "next/link";
import { ArrowRight, User, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";
import type { Platform } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

function MetaRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex size-[30px] flex-none items-center justify-center rounded-[9px] bg-blush-soft text-brand-hot">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[11px] font-bold tracking-[0.4px] text-[#777] uppercase">{label}</span>
        <span className="text-sm leading-snug font-semibold text-ink-2">{value}</span>
      </span>
    </div>
  );
}

export function PlatformCards({ platforms }: { platforms: Platform[] }) {
  if (!platforms.length) return null;
  return (
    <section
      id="platforms"
      className="bg-[radial-gradient(1100px_380px_at_50%_-10%,rgba(255,61,139,.08),transparent_60%),linear-gradient(180deg,#fff_0%,#fff7fb_100%)] px-3.5 py-12 text-center sm:px-5 md:py-20"
    >
      <SectionHeading
        badge="Vetted platforms"
        title={
          <>
            Best sites to <em>sell feet online</em>
          </>
        }
        subtitle="A shortlist of beginner-friendly platforms we’ve reviewed for safety, payouts, and ease of use."
      />

      <div className="stagger mx-auto mt-9 grid grid-cols-1 max-w-[1120px] gap-4 sm:grid-cols-2 md:mt-[52px] lg:grid-cols-4 lg:gap-[22px]">
        {platforms.map((platform) => (
          <article key={platform.id} className="sfo-card flex flex-col px-[18px] pt-[26px] pb-6 text-left sm:px-[22px]">
            {platform.isTopPick && (
              <span className="bg-gradient-brand absolute top-3.5 right-3.5 rounded-full px-2.5 py-[5px] text-[10.5px] font-bold tracking-[0.5px] text-white uppercase">
                Top pick
              </span>
            )}
            <h3
              className={cn(
                "mb-2.5 font-serif text-[22px] leading-tight font-semibold text-ink-2",
                platform.isTopPick && "pr-20",
              )}
            >
              {platform.name}
            </h3>
            <div className="mb-4 flex items-center gap-2">
              <Stars rating={platform.rating} />
              <span className="text-sm font-bold text-ink-2">{platform.rating.toFixed(1)}</span>
            </div>
            <div className="mt-0.5 space-y-3 border-t border-[#f3e3ea] pt-3.5">
              {platform.bestFor && <MetaRow icon={User} label="Best for" value={platform.bestFor} />}
              {platform.payoutSpeed && <MetaRow icon={Zap} label="Payout speed" value={platform.payoutSpeed} />}
            </div>
            <div className="mt-auto pt-5">
              <Link
                href={platform.reviewUrl || "/best-platforms/"}
                className="flex items-center justify-center gap-1.5 rounded-full bg-blush-soft px-4 py-[11px] text-sm font-bold text-brand-hot transition-colors hover:bg-brand-hot hover:text-white"
              >
                Read review <ArrowRight className="size-[15px]" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <p className="mx-auto mt-[34px] max-w-[640px] text-[12.5px] leading-relaxed text-[#999]">
        Ratings and details are based on our own reviews and may change over time. Always read each platform’s current
        terms before signing up.
      </p>
      <Link href="/best-platforms/" className="btn btn-secondary mt-6">
        Compare all platforms <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
