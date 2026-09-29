import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getFooterPages } from "@/lib/data/content";
import type { SiteSettings } from "@/lib/settings";
import { FOOTER_LEARN, FOOTER_RESOURCES, type NavItem } from "@/lib/site";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";

function FooterColumn({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="min-w-0">
      <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.1em] text-white">{title}</h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-block py-1 text-[14.5px] text-white/70 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer({ settings }: { settings: SiteSettings }) {
  const legalPages = await getFooterPages();
  const legal: NavItem[] = [
    ...legalPages.map((p) => ({ label: p.title, href: `/${p.slug}/` })),
    { label: "Sitemap", href: "/sitemap.xml" },
  ];
  const year = new Date().getFullYear();

  return (
    <footer className="bg-plum text-white/70">
      <Container className="pt-16 pb-10 md:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="col-span-2 max-w-[340px] md:col-span-3 lg:col-span-1">
            <Logo variant="white" className="mb-4 h-[60px]" />
            <p className="max-w-[32ch] text-[14.5px] leading-[1.7]">{settings.tagline}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/80">
              <span className="size-1.5 rounded-full bg-brand-light" /> For adults 18+ only
            </p>
            <SocialLinks settings={settings} className="mt-5" />
          </div>
          <FooterColumn title="Learn" items={FOOTER_LEARN} />
          <FooterColumn title="Resources" items={FOOTER_RESOURCES} />
          <FooterColumn title="Company" items={legal} />
        </div>

        <p className="mt-12 max-w-3xl text-[12.5px] leading-relaxed text-white/50">
          Affiliate disclosure: some links on this site are affiliate links, which means we may earn a commission if
          you sign up through them, at no extra cost to you. It never affects our rankings.{" "}
          <Link href="/affiliate-disclosure/" className="underline decoration-white/30 underline-offset-2 hover:text-white">
            Learn more
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-wrap justify-between gap-2.5 border-t border-white/10 pt-6 text-[13px]">
          <span>
            © {year} {settings.site_name}. All rights reserved.
          </span>
          {settings.footer_note && <span className="text-white/45">{settings.footer_note}</span>}
        </div>
      </Container>
    </footer>
  );
}
