import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import { getSettings } from "@/lib/data/settings";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** 404 for URLs that match no route at all (rendered outside the site layout). */
export default async function NotFound() {
  const settings = await getSettings();
  return (
    <>
      <Header />
      <main id="main">
        <NotFoundContent />
      </main>
      <Footer settings={settings} />
    </>
  );
}
