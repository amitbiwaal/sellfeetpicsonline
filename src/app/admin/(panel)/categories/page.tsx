import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { PageHeader } from "@/components/admin/ui";
import { listCategoriesWithCounts } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireUser();
  const items = await listCategoriesWithCounts();
  return (
    <>
      <PageHeader title="Categories" description="Group posts into topics. Each category gets its own page at /category/name/." />
      <TaxonomyManager kind="category" items={items.map((i) => ({ ...i, postCount: Number(i.postCount) }))} />
    </>
  );
}
