import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, LOGO, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import type { SiteSettings } from "@/lib/settings";
import { stripHtml, toIsoString, withTrailingSlash } from "@/lib/utils";

type SeoImage = { url: string; width?: number | null; height?: number | null; alt?: string };

type PageSeo = {
  title: string;
  description: string;
  path: string;
  /** Use the title as-is, without the " - SellFeetOnline" suffix. */
  absoluteTitle?: boolean;
  image?: SeoImage | null;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  authors?: string[];
  section?: string;
  tags?: string[];
};

/** Consistent metadata (canonical, Open Graph, Twitter, robots) for a page. */
export function pageMetadata(seo: PageSeo): Metadata {
  const url = withTrailingSlash(seo.path);
  const image = seo.image?.url
    ? {
        url: seo.image.url,
        width: seo.image.width ?? undefined,
        height: seo.image.height ?? undefined,
        alt: seo.image.alt || seo.title,
      }
    : { url: DEFAULT_OG_IMAGE.src, width: DEFAULT_OG_IMAGE.width, height: DEFAULT_OG_IMAGE.height, alt: SITE_NAME };
  const fullTitle = seo.absoluteTitle ? seo.title : `${seo.title} - ${SITE_NAME}`;

  const openGraph: Metadata["openGraph"] =
    seo.type === "article"
      ? {
          type: "article",
          title: fullTitle,
          description: seo.description,
          url,
          siteName: SITE_NAME,
          locale: "en_US",
          images: [image],
          publishedTime: toIsoString(seo.publishedTime),
          modifiedTime: toIsoString(seo.modifiedTime),
          authors: seo.authors,
          section: seo.section,
          tags: seo.tags,
        }
      : {
          type: seo.type === "profile" ? "profile" : "website",
          title: fullTitle,
          description: seo.description,
          url,
          siteName: SITE_NAME,
          locale: "en_US",
          images: [image],
        };

  return {
    title: seo.absoluteTitle ? { absolute: seo.title } : seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: seo.description,
      images: [image.url],
    },
    robots: seo.noindex ? { index: false, follow: true } : undefined,
  };
}

/* ---------------------------- JSON-LD ---------------------------- */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationJsonLd(settings: SiteSettings) {
  const sameAs = [
    settings.social_x,
    settings.social_instagram,
    settings.social_tiktok,
    settings.social_pinterest,
    settings.social_reddit,
  ].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: settings.site_name || SITE_NAME,
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: absoluteUrl(LOGO.src), width: LOGO.width, height: LOGO.height },
    email: settings.contact_email || undefined,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: settings.site_name || SITE_NAME,
    description: settings.tagline,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(withTrailingSlash(item.path)),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: stripHtml(item.answer) },
    })),
  };
}

type ArticleInput = {
  title: string;
  description: string;
  slug: string;
  image?: string;
  publishedAt: Date | null;
  updatedAt: Date;
  author?: { name: string; slug: string; jobTitle?: string; avatar?: string } | null;
  section?: string;
  keywords?: string[];
  wordCount?: number;
};

export function articleJsonLd(article: ArticleInput) {
  const url = absoluteUrl(`/${article.slug}/`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: article.title.slice(0, 110),
    description: article.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: article.image ? [absoluteUrl(article.image)] : [absoluteUrl(DEFAULT_OG_IMAGE.src)],
    datePublished: toIsoString(article.publishedAt ?? article.updatedAt),
    dateModified: toIsoString(article.updatedAt),
    author: article.author
      ? {
          "@type": "Person",
          name: article.author.name,
          url: absoluteUrl(`/author/${article.author.slug}/`),
          jobTitle: article.author.jobTitle || undefined,
          image: article.author.avatar ? absoluteUrl(article.author.avatar) : undefined,
        }
      : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    articleSection: article.section,
    keywords: article.keywords?.length ? article.keywords.join(", ") : undefined,
    wordCount: article.wordCount,
    inLanguage: "en-US",
  };
}

export function personJsonLd(author: {
  name: string;
  slug: string;
  jobTitle?: string;
  bio?: string;
  avatar?: string;
  sameAs?: string[];
}) {
  const url = absoluteUrl(`/author/${author.slug}/`);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      "@id": `${url}#person`,
      name: author.name,
      url,
      jobTitle: author.jobTitle || undefined,
      description: author.bio || undefined,
      image: author.avatar ? absoluteUrl(author.avatar) : undefined,
      worksFor: { "@id": ORG_ID },
      ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
    },
  };
}
