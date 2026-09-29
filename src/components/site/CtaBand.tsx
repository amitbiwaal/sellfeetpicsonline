import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

type Props = {
  badge?: string;
  title?: string;
  text?: string;
  buttonLabel?: string;
  href?: string;
};

/** Full-width pink gradient call-to-action band (from the original homepage). */
export function CtaBand({
  badge = "Start selling",
  title = "Turn safe, simple steps into steady income",
  text = "Follow our trusted guides and have your first listing live today — privacy intact, payouts secured.",
  buttonLabel = "Get the free guide",
  href = "/#articles",
}: Props) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#d81e66_0%,#ff9dc0_100%)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-plum/10 blur-3xl"
      />
      <Container className="relative py-16 text-center md:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white">
          {badge}
        </span>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-[31px] leading-[1.08] font-semibold tracking-[-0.02em] text-balance text-white md:text-[40px] lg:text-[50px]">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-white/90 md:text-lg">{text}</p>
        <Link href={href} className="btn btn-white mt-8">
          {buttonLabel} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Container>
    </section>
  );
}
