import { AboutSection } from "@/components/home/AboutSection";
import { EarningsCalculator } from "@/components/home/EarningsCalculator";
import { FaqSection } from "@/components/home/FaqSection";
import { Hero } from "@/components/home/Hero";
import { LatestArticles } from "@/components/home/LatestArticles";
import { PlatformCards } from "@/components/home/PlatformCards";
import { SafetyCards } from "@/components/home/SafetyCards";
import { StepsTimeline } from "@/components/home/StepsTimeline";
import { TrustStats } from "@/components/home/TrustStats";
import { WhatItMeans } from "@/components/home/WhatItMeans";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/ui/JsonLd";
import { HOME_FAQ } from "@/content/home-faq";
import { getHomePlatforms, getPublishedPosts } from "@/lib/data/content";
import { getSettings } from "@/lib/data/settings";
import { faqJsonLd, organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION } from "@/lib/site";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Sell Feet Online Safely & Earn With Confidence",
  description: SITE_DESCRIPTION,
  path: "/",
});

export default async function HomePage() {
  const [settings, platforms, latestPosts] = await Promise.all([
    getSettings(),
    getHomePlatforms(),
    getPublishedPosts({ limit: 3 }),
  ]);

  return (
    <>
      <Hero />
      <TrustStats />
      <AboutSection />
      <StepsTimeline />
      <CtaBand />
      <EarningsCalculator />
      <WhatItMeans />
      <SafetyCards />
      <PlatformCards platforms={platforms} />
      <LatestArticles posts={latestPosts} />
      <FaqSection items={HOME_FAQ} />
      <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings), faqJsonLd(HOME_FAQ)]} />
    </>
  );
}
