import { BookOpen, Monitor, RotateCw, Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FOUNDING_YEAR } from "@/lib/site";

const STATS = [
  { icon: BookOpen, value: "100+", label: "Guides published" },
  { icon: Monitor, value: "20+", label: "Platforms reviewed" },
  { icon: RotateCw, value: "Weekly", label: "Updated content" },
  { icon: Star, value: String(FOUNDING_YEAR), label: "Trusted since" },
];

export function TrustStats() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(1200px_400px_at_50%_-10%,rgba(255,61,139,0.10),transparent_60%),linear-gradient(180deg,#fff_0%,#fff6fa_100%)] px-3 py-10 sm:px-5 md:py-20">
      <SectionHeading
        badge="Trusted by beginners"
        title={
          <>
            Numbers That Build Your <em>confidence</em>
          </>
        }
        subtitle="Real guides, real platform reviews, and advice you can rely on from day one."
      />
      <div className="stagger mx-auto mt-8 grid max-w-[1080px] grid-cols-2 gap-2.5 sm:gap-4 md:mt-[52px] lg:grid-cols-4 lg:gap-[22px]">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="sfo-card bg-white/85 px-2.5 pt-[22px] pb-[18px] text-center backdrop-blur-sm sm:px-5 sm:pt-10 sm:pb-[34px]"
          >
            <div className="sfo-icon mx-auto mb-2.5 size-10 rounded-[11px] sm:mb-[18px] sm:size-[54px] sm:rounded-[14px]">
              <Icon className="size-5 sm:size-[26px]" strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="text-gradient font-serif text-[clamp(20px,6vw,26px)] leading-none font-bold sm:text-[clamp(24px,2.6vw,32px)]">
              {value}
            </div>
            <div className="mt-2 text-[12.5px] font-semibold text-ink-2 sm:text-[15px]">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
