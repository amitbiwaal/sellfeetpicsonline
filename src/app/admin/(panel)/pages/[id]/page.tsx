import { notFound } from "next/navigation";
import { PageEditor } from "@/components/admin/PageEditor";
import { getPageForEdit } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";
import { getSettings } from "@/lib/data/settings";
import { SITE_URL } from "@/lib/site";

export const metadata = { title: "Edit page" };

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const [page, settings] = await Promise.all([getPageForEdit(id), getSettings()]);
  if (!page) notFound();

  return (
    <PageEditor
      key={page.id}
      initial={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        intro: page.intro,
        content: page.content,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        noindex: page.noindex,
        showInFooter: page.showInFooter,
      }}
      siteName={settings.site_name}
      siteHost={new URL(SITE_URL).host}
    />
  );
}
