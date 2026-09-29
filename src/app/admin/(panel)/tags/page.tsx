import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { PageHeader } from "@/components/admin/ui";
import { listTagsWithCounts } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "Tags" };

export default async function TagsPage() {
  await requireUser();
  const items = await listTagsWithCounts();
  return (
    <>
      <PageHeader
        title="Tags"
        description="Keywords attached to posts. Tag pages are hidden from Google (noindex) to avoid thin content."
      />
      <TaxonomyManager kind="tag" items={items.map((i) => ({ ...i, postCount: Number(i.postCount) }))} />
    </>
  );
}
