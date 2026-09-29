import { SectionHeading } from "@/components/ui/SectionHeading";
import type { FaqItem } from "@/content/home-faq";
import { FaqAccordion } from "./Faq";

export function FaqSection({
  items,
  title,
  subtitle = "Everything beginners usually ask before they start.",
}: {
  items: FaqItem[];
  title?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <section id="faq" className="bg-[linear-gradient(180deg,#fff_0%,#fff7fb_100%)] px-3.5 py-12 sm:px-5 md:py-20">
      <div className="mx-auto max-w-[820px]">
        <SectionHeading
          badge="FAQs"
          title={
            title ?? (
              <>
                Questions, <em>answered</em>
              </>
            )
          }
          subtitle={subtitle}
          className="mb-9 md:mb-12"
        />
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
