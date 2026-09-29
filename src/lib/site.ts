export const SITE_NAME = "SellFeetOnline";

/** Public base URL without a trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sellfeetonline.com"
).replace(/\/+$/, "");

export const SITE_TAGLINE =
  "The beginner-friendly guide to earning safely, privately, and on your own terms.";

export const SITE_DESCRIPTION =
  "A clear, step-by-step path to sell feet pics online safely. Vetted platforms, privacy tips, pricing advice and an earnings calculator for beginners.";

export const FOUNDING_YEAR = 2024;

export const LOGO = { src: "/images/logo.png", width: 886, height: 346 };
export const LOGO_WHITE = { src: "/images/logo-white.png", width: 872, height: 312 };
export const DEFAULT_OG_IMAGE = { src: "/images/og-default.jpg", width: 1200, height: 630 };

export type NavItem = { label: string; href: string };

export const MAIN_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Best Platforms", href: "/best-platforms/" },
  { label: "Safety Tips", href: "/safety-tips/" },
  { label: "Blog", href: "/blog/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

export const FOOTER_LEARN: NavItem[] = [
  { label: "About us", href: "/about/" },
  { label: "Blog", href: "/blog/" },
  { label: "Get started", href: "/#start" },
  { label: "Contact", href: "/contact/" },
];

export const FOOTER_RESOURCES: NavItem[] = [
  { label: "Best platforms", href: "/best-platforms/" },
  { label: "Safety tips", href: "/safety-tips/" },
  { label: "Earnings calculator", href: "/#calculator" },
  { label: "FAQs", href: "/#faq" },
];

/** Slugs of the legal pages created by the seed (editable in Admin → Pages). */
export const LEGAL_PAGES: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Terms of Service", href: "/terms-of-service/" },
  { label: "Disclaimer", href: "/disclaimer/" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure/" },
  { label: "Cookie Policy", href: "/cookie-policy/" },
  { label: "DMCA Policy", href: "/dmca-policy/" },
  { label: "Editorial Policy", href: "/editorial-policy/" },
];

/**
 * Top-level paths used by the app itself. Posts and pages can't use these
 * slugs because the static routes would always win.
 */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "about",
  "author",
  "best-platforms",
  "blog",
  "category",
  "contact",
  "feed",
  "images",
  "media",
  "page",
  "robots.txt",
  "safety-tips",
  "search",
  "sitemap.xml",
  "tag",
  "wp-admin",
  "wp-content",
  "wp-json",
  "wp-login.php",
  "_next",
]);

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
