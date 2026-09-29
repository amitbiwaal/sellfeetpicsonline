import { PageEditor } from "@/components/admin/PageEditor";
import { requireUser } from "@/lib/auth/dal";
import { getSettings } from "@/lib/data/settings";
import { SITE_URL } from "@/lib/site";

export const metadata = { title: "New page" };

export default async function NewPagePage() {
  await requireUser();
  const settings = await getSettings();
  return (
    <PageEditor
      initial={{
        title: "",
        slug: "",
        intro: "",
        content: "",
        status: "draft",
        seoTitle: "",
        seoDescription: "",
        noindex: false,
        showInFooter: false,
      }}
      siteName={settings.site_name}
      siteHost={new URL(SITE_URL).host}
    />
  );
}
