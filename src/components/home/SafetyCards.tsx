import Link from "next/link";
import { ArrowRight, EyeOff, ImagePlus, Lock, TriangleAlert } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const HABITS = [
  { icon: EyeOff, title: "Hide identity", text: "Use a nickname and never share personal details with buyers." },
  { icon: TriangleAlert, title: "Avoid scams", text: "Only deal inside trusted, verified platforms that handle payment." },
  { icon: ImagePlus, title: "Watermark photos", text: "Mark your images so they cannot be stolen or resold." },
  { icon: Lock, title: "Secure payments", text: "Get paid only through the platform system, never off site." },
];

export function SafetyCards({ showLink = true }: { showLink?: boolean }) {
  return (
    <section className="bg-[linear-gradient(180deg,#fff7fb_0%,#fff_100%)] px-3.5 py-12 text-center sm:px-5 md:py-20">
      <SectionHeading
        badge="Safety & privacy"
        title={
          <>
            Stay <em>safe</em>, stay private
          </>
        }
        subtitle="Four simple habits that protect you from day one."
      />
      <div className="stagger mx-auto mt-9 grid grid-cols-1 max-w-[1080px] gap-3.5 sm:grid-cols-2 md:mt-[52px] lg:grid-cols-4 lg:gap-[22px]">
        {HABITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="sfo-card px-5 py-[26px] text-center sm:px-[22px] sm:py-[34px]">
            <div className="sfo-icon mx-auto mb-[18px] size-[58px]">
              <Icon className="size-7" aria-hidden="true" />
            </div>
            <h3 className="mb-2 font-serif text-[21px] leading-tight font-semibold text-ink-2">{title}</h3>
            <p className="text-sm leading-[1.55] text-[#777]">{text}</p>
          </div>
        ))}
      </div>
      {showLink && (
        <Link href="/safety-tips/" className="btn btn-secondary mt-10">
          Read the full safety guide <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
