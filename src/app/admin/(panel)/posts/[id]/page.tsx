import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { getEditorOptions, getPostForEdit } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";
import { getSettings } from "@/lib/data/settings";
import { SITE_URL } from "@/lib/site";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [post, options, settings] = await Promise.all([getPostForEdit(id), getEditorOptions(), getSettings()]);
  if (!post) notFound();

  return (
    <PostEditor
      key={post.id}
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        featuredImageAlt: post.featuredImageAlt,
        status: post.status,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        authorId: post.authorId,
        categoryId: post.categoryId,
        tags: post.tags,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        noindex: post.noindex,
        updatedAt: post.updatedAt.toISOString(),
      }}
      options={options}
      siteName={settings.site_name}
      siteHost={new URL(SITE_URL).host}
    />
  );
}
