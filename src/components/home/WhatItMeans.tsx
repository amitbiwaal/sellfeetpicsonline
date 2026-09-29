import Link from "next/link";
import { Check, Clock, DollarSign, Landmark, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/SectionHeading";

function SubHeading({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <h3 className="mt-[30px] mb-2.5 flex items-center gap-3 font-serif text-[clamp(20px,2.4vw,26px)] leading-tight font-semibold text-ink-2">
      <span className="flex size-[34px] flex-none items-center justify-center rounded-[11px] bg-blush-soft text-brand-hot sm:size-[38px]">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      {children}
    </h3>
  );
}

export function WhatItMeans() {
  return (
    <section className="bg-[linear-gradient(180deg,#fff_0%,#fff7fb_100%)] px-4 py-12 md:px-5 md:py-20">
      <div className="mx-auto max-w-[820px] text-[15.5px] leading-[1.75] text-body sm:text-base [&_p]:mb-3.5">
        <Badge className="mb-5">The basics</Badge>
        <h2 className="mb-[18px] font-serif text-[clamp(28px,4vw,44px)] leading-[1.12] font-semibold tracking-[-0.5px] text-ink-2">
          What does <em className="text-brand-hot italic">“sell feet online”</em> actually mean?
        </h2>
        <p className="text-base leading-[1.7] sm:text-[17px]">
          If you’ve come across the idea of selling feet pictures and felt unsure where to begin, you’re not alone. The
          phrase simply describes earning money by sharing photos of your feet with buyers through online platforms. It
          has quietly become one of the most beginner-friendly ways to earn a flexible side income from home — no special
          skills, audience, or upfront investment required.
        </p>

        <SubHeading icon={Clock}>How it works</SubHeading>
        <p>
          The process is straightforward. You take clear, well-lit photos of your feet, create a profile on a trusted
          platform, and list your images for sale. Buyers browse, purchase individual photos, or subscribe for regular
          content. Most platforms handle the payments and messaging for you, so you can focus on creating images and
          building a small base of repeat customers. Many sellers start with just a smartphone camera and natural
          daylight.
        </p>

        <SubHeading icon={Landmark}>Is it legal?</SubHeading>
        <p>
          Yes. Selling feet pictures is completely legal for adults in most countries, as long as the content is
          non-explicit and you are over 18.
        </p>
        <p>
          Reputable platforms verify the age of every seller and have clear rules to keep transactions safe. The most
          important things are to use a platform that protects your identity, keep your personal information private, and
          read each site’s terms before you start. When you follow these basics, it’s a legitimate and low-risk way to
          earn.
        </p>

        <SubHeading icon={Check}>How beginners start</SubHeading>
        <p>
          Getting started takes less time than most people expect — often an afternoon. First, choose one{" "}
          <Link href="/best-platforms/" className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand">
            vetted platform
          </Link>{" "}
          rather than spreading yourself thin across many. Next, set up a profile that protects your privacy (a nickname,
          no identifying details, and watermarked photos are smart first steps).
        </p>
        <p>
          Then upload a small set of quality images, set fair prices, and respond politely to buyers. Consistency matters
          more than volume: posting regularly and staying professional helps you build trust and repeat sales over time.
        </p>

        <SubHeading icon={MapPin}>Where to sell feet pics</SubHeading>
        <p>
          The best place to sell feet pics is a dedicated, verified marketplace built for this kind of content rather than
          a general social platform. Dedicated sites handle payments, protect your identity, and connect you with buyers
          who are actually looking to purchase.
        </p>
        <p>
          Our team reviews these platforms for safety, payout speed, and ease of use, so you can compare your options and
          pick the one that fits how you want to work. You will find{" "}
          <Link href="#platforms" className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand">
            our current shortlist
          </Link>{" "}
          further down this page.
        </p>

        <SubHeading icon={DollarSign}>Expected earnings</SubHeading>
        <p>
          Earnings vary widely and depend on your effort, pricing, and consistency. Many beginners earn a modest amount in
          their first weeks while they learn what buyers want. As you build a small following and a library of photos, it
          is realistic to grow toward a steady side income each month.
        </p>
        <p>
          Some dedicated sellers earn significantly more, but it is healthiest to treat the first few months as a learning
          phase and let your income climb gradually rather than expecting overnight results.
        </p>

        <div className="mt-[34px] rounded-[14px] border border-l-4 border-line-2 border-l-brand-hot bg-white px-[22px] py-5 text-[15.5px] leading-[1.65]">
          <strong className="text-brand-hot">In short:</strong> selling feet pictures online is a legal,
          beginner-friendly way to earn flexibly from home — and the safest results come from choosing a trusted platform,
          protecting your privacy, and building up consistently over time.
        </div>
      </div>
    </section>
  );
}
