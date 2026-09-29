import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { TocInline, TocSidebar } from "@/components/blog/TableOfContents";
import { FaqSection } from "@/components/home/FaqSection";
import { SafetyCards } from "@/components/home/SafetyCards";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import type { FaqItem } from "@/content/home-faq";
import type { TocItem } from "@/lib/content/html";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Safety Tips for Selling Feet Pics Online (2026)",
  description:
    "How to sell feet pics safely: stay anonymous, strip photo location data, watermark your content, spot common scams and get paid securely.",
  path: "/safety-tips/",
});

const SECTIONS: TocItem[] = [
  { id: "protect-your-identity", text: "Protect your identity", level: 2 },
  { id: "remove-photo-metadata", text: "Remove hidden data from your photos", level: 2 },
  { id: "watermark-your-content", text: "Watermark and protect your content", level: 2 },
  { id: "avoid-scams", text: "Spot and avoid common scams", level: 2 },
  { id: "get-paid-safely", text: "Get paid safely", level: 2 },
  { id: "secure-your-accounts", text: "Lock down your accounts", level: 2 },
  { id: "set-boundaries", text: "Set boundaries with buyers", level: 2 },
  { id: "know-the-rules", text: "Know the rules", level: 2 },
  { id: "if-something-goes-wrong", text: "If something goes wrong", level: 2 },
  { id: "checklist", text: "Your pre-upload checklist", level: 2 },
];

const CHECKLIST = [
  "Stage name and a separate email address set up",
  "Location tagging turned off in your camera",
  "Backgrounds checked for anything personal",
  "Watermark added to every photo you share",
  "Two-factor authentication on your email and platform",
  "All chat and payments kept inside the platform",
  "Your boundaries and prices decided in advance",
];

const SAFETY_FAQ: FaqItem[] = [
  {
    question: "Can buyers find out who I am from my photos?",
    answer:
      "They can if your photos contain clues: location data in the file, a recognizable background, tattoos you show elsewhere, or images you've also posted on personal accounts. Strip metadata, check every background and keep your selling identity completely separate.",
  },
  {
    question: "Is it safe to send photos by email or messaging apps?",
    answer:
      "It's much safer to deliver content through your platform. Off-platform deals remove buyer verification and payment protection, and they're where most scams happen.",
  },
  {
    question: "What should I do if a buyer asks me to pay a fee to receive money?",
    answer:
      "Stop and block them. Legitimate buyers never ask you to pay a “verification”, “unlock” or “transfer” fee to get paid. It is one of the most common scams sellers face.",
  },
  {
    question: "How do I get stolen photos taken down?",
    answer:
      'Send a DMCA takedown notice to the website or its hosting provider and ask search engines to remove the links. See our <a href="/dmca-policy/">DMCA policy</a> for what a notice should include.',
  },
];

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function SafetyTipsPage() {
  return (
    <>
      <PageHero
        badge="Safety & privacy"
        title={
          <>
            Safety tips for selling feet pics <em>online</em>
          </>
        }
        subtitle="Protect your identity, avoid scams and keep your content yours. Everything we'd tell a friend before their first upload."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Safety Tips", path: "/safety-tips/" },
        ]}
        image={{
          src: "/wp-content/uploads/2026/06/bbfg.webp",
          alt: "Seller photographing her feet next to icons for privacy, secure platforms and confidentiality",
          width: 1695,
          height: 928,
        }}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#checklist" className="btn btn-primary">
            Jump to the checklist
          </Link>
          <Link href="/best-platforms/" className="btn btn-secondary">
            Find a safe platform
          </Link>
        </div>
      </PageHero>

      <SafetyCards showLink={false} />

      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_280px] xl:gap-16">
          <div className="min-w-0 lg:max-w-[760px]">
            <TocInline items={SECTIONS} />
            <div className="prose-sfo">
              <p>
                Selling feet pictures is legal for adults in most countries, and with the right habits it can be a
                low-risk side income. The risks come from a small number of predictable places: personal details
                leaking through your photos, buyers who try to move you off-platform, and content being reposted without
                permission. This guide walks through each one.
              </p>

              <h2 id="protect-your-identity">Protect your identity</h2>
              <p>Your goal is simple: nothing you post should connect your selling profile to your real life.</p>
              <ul>
                <li>
                  <strong>Use a stage name</strong> and a brand-new email address that you only use for selling.
                </li>
                <li>
                  <strong>Keep identifying features out of frame:</strong> your face, tattoos, birthmarks, and any
                  jewelry or nail art you also show on personal accounts.
                </li>
                <li>
                  <strong>Check every background.</strong> Mail, packaging labels, windows with a view, mirrors, family
                  photos and distinctive furniture can all give you away.
                </li>
                <li>
                  <strong>Never reuse photos or usernames</strong> from your personal social media. Reverse image search
                  makes it easy to link accounts.
                </li>
                <li>
                  <strong>Don&apos;t share personal details</strong> such as your real name, city, workplace, school or
                  schedule, even in casual conversation.
                </li>
              </ul>

              <h2 id="remove-photo-metadata">Remove hidden data from your photos</h2>
              <p>
                Photos taken on a phone can carry hidden information called EXIF metadata, including the exact GPS
                location where the picture was taken, the date and time, and your phone model. Remove it before sharing
                anything:
              </p>
              <ul>
                <li>
                  <strong>iPhone:</strong> go to Settings → Privacy &amp; Security → Location Services → Camera and
                  choose <em>Never</em>. When sharing an existing photo, tap <em>Options</em> in the share sheet and turn
                  off <em>Location</em>.
                </li>
                <li>
                  <strong>Android:</strong> open your Camera app settings and turn off <em>Location tags</em> (sometimes
                  called <em>Save location</em>).
                </li>
                <li>
                  <strong>Any device:</strong> run photos through a trusted metadata-removal app before uploading. Many
                  platforms strip metadata automatically, but don&apos;t rely on it.
                </li>
              </ul>

              <h2 id="watermark-your-content">Watermark and protect your content</h2>
              <p>Stolen and resold photos are a common problem. A few habits make your content much less attractive to thieves:</p>
              <ul>
                <li>
                  <strong>Watermark every image</strong> with your stage name or username. Place it across the photo, not
                  in a corner that can simply be cropped off.
                </li>
                <li>
                  <strong>Share low-resolution previews</strong> and deliver full-quality files only after payment,
                  through the platform.
                </li>
                <li>
                  <strong>Search for your photos</strong> every few weeks with{" "}
                  <ExternalLink href="https://lens.google/">Google Lens</ExternalLink> or{" "}
                  <ExternalLink href="https://tineye.com/">TinEye</ExternalLink> to catch reposts early.
                </li>
                <li>
                  <strong>If your content is stolen,</strong> send a DMCA takedown notice to the website or its host,
                  and ask search engines to remove the links through{" "}
                  <ExternalLink href="https://support.google.com/legal/answer/3110420">Google&apos;s removal request tool</ExternalLink>
                  . Our <Link href="/dmca-policy/">DMCA policy</Link> explains what a notice needs to include.
                </li>
              </ul>

              <h2 id="avoid-scams">Spot and avoid common scams</h2>
              <p>Almost every scam aimed at sellers follows one of these patterns. If you see one, stop replying:</p>
              <ul>
                <li>
                  <strong>&quot;Pay a fee to receive your money.&quot;</strong> Real buyers never ask you to pay a
                  verification, unlock or transfer fee.
                </li>
                <li>
                  <strong>Fake payment proof.</strong> Screenshots and emails saying &quot;I&apos;ve paid, check your
                  inbox&quot; mean nothing. Only trust the balance in your platform dashboard.
                </li>
                <li>
                  <strong>Overpayment refunds.</strong> A buyer &quot;accidentally&quot; sends too much and asks you to
                  return the difference. The original payment later bounces.
                </li>
                <li>
                  <strong>Gift cards and crypto.</strong> Requests to pay or be paid this way are a red flag because
                  they can&apos;t be traced or reversed.
                </li>
                <li>
                  <strong>&quot;Let&apos;s move to WhatsApp, Telegram or email.&quot;</strong> Leaving the platform
                  removes buyer verification and payment protection.
                </li>
                <li>
                  <strong>Endless free samples.</strong> People who ask for free previews and never buy are wasting your
                  time, and sometimes collecting content to resell.
                </li>
                <li>
                  <strong>Reversible payments.</strong> Personal payment transfers can be charged back after you deliver.
                </li>
                <li>
                  <strong>Fake agencies and managers</strong> that promise big earnings in exchange for your login or an
                  upfront fee.
                </li>
              </ul>

              <h2 id="get-paid-safely">Get paid safely</h2>
              <ul>
                <li>Keep every sale inside the platform. Its payout system protects you from fake and reversed payments.</li>
                <li>Never share bank logins, card numbers or one-time codes sent to your phone.</li>
                <li>Consider a separate bank account or e-wallet for your earnings to keep records tidy.</li>
                <li>Track what you earn. In most countries this income is taxable, so keep simple records from day one.</li>
              </ul>

              <h2 id="secure-your-accounts">Lock down your accounts</h2>
              <ul>
                <li>Use a unique, strong password for your email and each platform. A password manager makes this easy.</li>
                <li>Turn on two-factor authentication, ideally with an authenticator app rather than SMS.</li>
                <li>Don&apos;t click login links in messages. Type the platform&apos;s address yourself.</li>
                <li>Every so often, review active sessions and connected apps and remove anything you don&apos;t recognize.</li>
              </ul>

              <h2 id="set-boundaries">Set boundaries with buyers</h2>
              <ul>
                <li>Decide in advance what you will and won&apos;t create. You can say no to any request.</li>
                <li>Keep conversations polite and professional, and block anyone who harasses or pressures you.</li>
                <li>Never agree to meet a buyer in person.</li>
                <li>If you ever ship anything, use a PO box or parcel locker, never your home address.</li>
              </ul>

              <h2 id="know-the-rules">Know the rules</h2>
              <ul>
                <li>You must be 18 or older. Reputable platforms verify every seller&apos;s age and identity.</li>
                <li>Read each platform&apos;s content rules and follow them, including any limits on explicit content.</li>
                <li>Only sell photos of your own feet that you took yourself. Never use other people&apos;s images.</li>
                <li>Laws differ between countries, so check the rules where you live if you&apos;re unsure.</li>
              </ul>

              <h2 id="if-something-goes-wrong">If something goes wrong</h2>
              <ol>
                <li>
                  <strong>Stop engaging.</strong> Don&apos;t pay, negotiate with or argue with anyone threatening you.
                </li>
                <li>
                  <strong>Save evidence:</strong> screenshots of messages, usernames, profile links and any payment
                  details.
                </li>
                <li>
                  <strong>Report and block</strong> the account on the platform, and contact the platform&apos;s support
                  team.
                </li>
                <li>
                  <strong>Report threats or extortion</strong> to the police. In the US you can also report to the{" "}
                  <ExternalLink href="https://www.ic3.gov/">FBI&apos;s IC3</ExternalLink>, and in the UK to{" "}
                  <ExternalLink href="https://www.actionfraud.police.uk/">Action Fraud</ExternalLink>.
                </li>
                <li>
                  <strong>Get content removed</strong> with DMCA takedown notices, and use{" "}
                  <ExternalLink href="https://stopncii.org/">StopNCII.org</ExternalLink> if intimate images are involved.
                </li>
              </ol>
            </div>

            <section id="checklist" className="mt-12 scroll-mt-28 rounded-[26px] border border-line bg-[linear-gradient(150deg,#fff5f8,#ffe6ef)] p-6 sm:p-9">
              <h2 className="font-serif text-[28px] font-semibold text-ink">Your pre-upload checklist</h2>
              <p className="mt-2 text-muted">Tick these off before you share your first photo.</p>
              <ul className="mt-6 space-y-3">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-xl bg-white/80 px-4 py-3 text-[15px] font-medium text-ink">
                    <CheckCircle2 className="mt-0.5 size-5 flex-none text-brand" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <TocSidebar items={SECTIONS} />
              <div className="rounded-2xl bg-[linear-gradient(150deg,#d81e66,#ff7aa8)] p-5 text-white">
                <p className="font-serif text-xl leading-snug font-semibold">Choose a safer platform</p>
                <p className="mt-2 text-sm text-white/90">Verified sellers, in-platform payments and real buyers.</p>
                <Link href="/best-platforms/" className="btn btn-white btn-sm mt-4">
                  See our picks
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      <FaqSection items={SAFETY_FAQ} title={<>Safety <em>questions</em></>} subtitle="Quick answers to the worries we hear most." />

      <CtaBand
        title="Ready to start, safely?"
        text="Pick a vetted platform and follow our step-by-step guide to your first sale."
        buttonLabel="See the best platforms"
        href="/best-platforms/"
      />

      <JsonLd data={faqJsonLd(SAFETY_FAQ)} />
    </>
  );
}
