import { draftMode } from "next/headers";
import { Analytics } from "@/components/site/Analytics";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PreviewBanner } from "@/components/site/PreviewBanner";
import { getSettings } from "@/lib/data/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const { isEnabled: preview } = await draftMode();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-brand focus:shadow-lg"
      >
        Skip to content
      </a>
      {preview && <PreviewBanner />}
      <Header />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      {settings.ga_measurement_id && <Analytics measurementId={settings.ga_measurement_id} />}
    </>
  );
}
