import { ArrowRight, Lock, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";

const REASONS = [
  {
    icon: Star,
    title: "Why us",
    text: "Honest, tested advice. We only recommend tools and tactics we'd use ourselves.",
  },
  {
    icon: ArrowRight,
    title: "Get started",
    text: "A short setup, the right platform, and your first listing live in an afternoon.",
  },
  {
    icon: Lock,
    title: "Stay protected",
    text: "Keep your identity private with watermarking, payout, and metadata best practices.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="border-t border-[#c5467d30] py-16 md:py-20">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="sfo-badge-outline">About us</span>
          <h2 className="mt-5 font-serif text-[29px] leading-[1.08] font-semibold tracking-[-0.02em] text-balance text-ink md:text-[37px] lg:text-[46px]">
            We Help Beginners Earn <span className="text-brand italic">on their terms</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-[1.6] text-muted">
            At SellFeetOnline we guide first timers through selling feet pictures and building real income on platforms
            we trust, without the guesswork or the risk.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-[22px] md:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="sfo-card rounded-[18px] border-line p-6 sm:p-[30px]">
              <div className="sfo-icon mb-5 size-[52px] rounded-[14px] bg-blush text-brand">
                <Icon className="size-[26px]" fill={Icon === Star ? "currentColor" : "none"} aria-hidden="true" />
              </div>
              <h3 className="font-serif text-[22px] font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-[15.5px] leading-[1.6] text-muted">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-full rounded-[26px] border border-line bg-[linear-gradient(150deg,#fff5f8,#ffe6ef)] p-8 md:p-9">
            <span className="text-xs font-bold tracking-[0.14em] text-brand uppercase">Track your growth</span>
            <h3 className="mt-2.5 mb-2 font-serif text-[25px] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
              Watch your income climb, month over month
            </h3>
            <p className="mb-[18px] text-[15.5px] text-muted">
              A simple dashboard view of what&apos;s working — so you can do more of it.
            </p>
            <div className="flex gap-8">
              <div>
                <span className="block font-serif text-[27px] font-semibold text-brand-dark">$1,250</span>
                <span className="text-[12.5px] text-subtle">Total earnings</span>
              </div>
              <div>
                <span className="block font-serif text-[27px] font-semibold text-brand-dark">+$350</span>
                <span className="text-[12.5px] text-subtle">This month</span>
              </div>
            </div>
          </div>

          <div className="h-full rounded-[26px] border border-line bg-[linear-gradient(150deg,#fdf2f8,#fce0ec)] p-8 md:p-9">
            <span className="text-xs font-bold tracking-[0.14em] text-brand uppercase">Built on trust</span>
            <h3 className="mt-2.5 mb-2 font-serif text-[25px] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
              Your privacy is the priority, always
            </h3>
            <p className="mb-4 text-[15.5px] text-muted">
              Discreet, confidential, and secure from your first upload to your first payout.
            </p>
            <ul className="space-y-2 text-[15px] font-medium text-ink">
              {["Your privacy stays yours", "Secure, vetted platforms", "Discreet & confidential"].map((item) => (
                <li key={item}>
                  <span className="mr-1.5 font-bold text-brand">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
