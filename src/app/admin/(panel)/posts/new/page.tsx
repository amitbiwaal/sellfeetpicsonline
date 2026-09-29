import { PostEditor } from "@/components/admin/PostEditor";
import { getEditorOptions } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";
import { getLeadAuthor } from "@/lib/data/content";
import { getSettings } from "@/lib/data/settings";
import { SITE_URL } from "@/lib/site";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireUser();
  const [options, leadAuthor, settings] = await Promise.all([getEditorOptions(), getLeadAuthor(), getSettings()]);

  return (
    <PostEditor
      initial={{
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featuredImage: "",
        featuredImageAlt: "",
        status: "draft",
        publishedAt: null,
        authorId: leadAuthor?.id ?? options.authors[0]?.id ?? null,
        categoryId: null,
        tags: [],
        seoTitle: "",
        seoDescription: "",
        noindex: false,
      }}
      options={options}
      siteName={settings.site_name}
      siteHost={new URL(SITE_URL).host}
    />
  );
}
