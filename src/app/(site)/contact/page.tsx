import Image from "next/image";
import { HeartHandshake, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getSettings } from "@/lib/data/settings";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "./ContactForm";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Questions about selling feet pics or our platform recommendations? Get in touch with the SellFeetOnline team — we're here to help.",
  path: "/contact/",
});

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <section className="bg-[linear-gradient(180deg,#fff5f8_0%,#ffffff_60%)]">
      <Container className="pt-6 pb-16 md:pb-24">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact/" },
          ]}
        />
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div>
            <span className="sfo-badge-outline">Contact us</span>
            <h1 className="sfo-h1 mt-5">
              Get in <em>Touch</em>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
              Have questions about selling feet pics or need help with our platform recommendations? We&apos;re here to
              guide you every step of the way.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
              <div className="rounded-2xl border border-line bg-white p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blush-soft text-brand-hot">
                  <Mail className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-xs font-bold tracking-[0.14em] text-brand uppercase">We&apos;re ready</p>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="mt-1 block text-[15px] font-semibold [overflow-wrap:anywhere] text-ink hover:text-brand"
                >
                  {settings.contact_email}
                </a>
              </div>
              <div className="rounded-2xl border border-line bg-white p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blush-soft text-brand-hot">
                  <HeartHandshake className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-xs font-bold tracking-[0.14em] text-brand uppercase">Friendly help</p>
                <p className="mt-1 font-semibold text-ink">We read every message</p>
              </div>
            </div>

            <Image
              src="/wp-content/uploads/2026/06/bbfg.webp"
              alt="Woman photographing her feet with a phone next to privacy and security icons"
              width={1695}
              height={928}
              loading="eager"
              sizes="(min-width: 1024px) 520px, 100vw"
              className="mt-8 h-auto w-full rounded-[22px] border border-line"
            />
          </div>

          <div className="lg:pt-2">
            <div className="rounded-[26px] border border-line bg-white p-6 shadow-[0_30px_70px_-45px_rgba(168,21,78,0.5)] sm:p-9">
              <h2 className="font-serif text-2xl font-semibold text-ink">Send us a message</h2>
              <p className="mt-1.5 mb-7 text-sm text-subtle">Fields marked * are required.</p>
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
