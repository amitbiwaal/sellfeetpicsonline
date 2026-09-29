import { NotFoundContent } from "@/components/site/NotFoundContent";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** 404 inside the site layout (header and footer come from (site)/layout.tsx). */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
