import { CreditCard, DollarSign, ImagePlus, ShieldCheck, UserPlus, Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create account",
    text: "Pick one trusted platform and sign up with an email. Choose a nickname instead of your real name to protect your privacy from the start.",
  },
  {
    icon: ShieldCheck,
    title: "Verify profile",
    text: "Complete the platform’s age and identity check. This keeps the marketplace safe and unlocks your ability to list photos and get paid.",
  },
  {
    icon: ImagePlus,
    title: "Upload photos",
    text: "Add a small set of clear, well-lit photos. Use natural daylight, keep them tasteful, and add a watermark to protect your images.",
  },
  {
    icon: DollarSign,
    title: "Set pricing",
    text: "Start with fair, beginner-level prices and offer simple bundles. You can raise prices later as you gain reviews and repeat buyers.",
  },
  {
    icon: Users,
    title: "Get buyers",
    text: "Reply quickly and politely, post consistently, and stay professional. Good service turns first-time buyers into loyal repeat customers.",
  },
  {
    icon: CreditCard,
    title: "Receive payment",
    text: "Withdraw your earnings securely through the platform’s payout system. Watch your income grow month over month as you keep going.",
  },
];

export function StepsTimeline() {
  return (
    <section id="start" className="bg-[linear-gradient(180deg,#fff7fb_0%,#fff_100%)] px-3.5 py-12 sm:px-5 md:py-20">
      <div className="mx-auto max-w-[760px]">
        <SectionHeading
          badge="Step by step"
          title={
            <>
              How to <em>sell feet online</em>
            </>
          }
          subtitle="Six simple steps to go from zero to your first payout — most people finish in an afternoon."
          className="mb-10 md:mb-14"
        />

        <ol className="stagger relative before:absolute before:top-2 before:bottom-2 before:left-[22px] before:w-0.5 before:bg-[#f6d4e2] sm:before:left-[27px]">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="relative flex gap-4 pb-[22px] last:pb-0 sm:gap-[22px] sm:pb-[30px]">
              <div className="bg-gradient-brand relative z-10 flex size-[46px] flex-none items-center justify-center rounded-[13px] font-serif text-lg font-bold text-white shadow-[0_8px_18px_rgba(230,17,107,0.28)] sm:size-14 sm:rounded-2xl sm:text-[22px]">
                {index + 1}
              </div>
              <div className="flex-1 rounded-2xl border border-line-2 bg-white px-4 py-4 transition duration-300 hover:-translate-y-1 hover:border-[#f0c0d5] hover:shadow-pink-sm sm:px-5 sm:py-[18px]">
                <h3 className="mb-1.5 flex items-center gap-2.5 font-serif text-lg leading-tight font-semibold text-ink-2 sm:text-xl">
                  <Icon className="size-5 flex-none text-brand-hot" aria-hidden="true" />
                  {title}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-body">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
