import { notFound } from "next/navigation";
import { PlatformForm } from "@/components/admin/PlatformForm";
import { PageHeader } from "@/components/admin/ui";
import { getPlatformForEdit } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "Edit platform" };

export default async function EditPlatformPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const p = await getPlatformForEdit(id);
  if (!p) notFound();

  return (
    <>
      <PageHeader title={p.name} back={{ href: "/admin/platforms/", label: "Platforms" }} />
      <PlatformForm
        key={p.id}
        initial={{
          id: p.id,
          name: p.name,
          slug: p.slug,
          rating: String(p.rating),
          score: p.score != null ? String(p.score) : "",
          bestFor: p.bestFor,
          payoutSpeed: p.payoutSpeed,
          sellerCost: p.sellerCost,
          commission: p.commission,
          buyerTraffic: p.buyerTraffic,
          summary: p.summary,
          websiteUrl: p.websiteUrl,
          reviewUrl: p.reviewUrl,
          isTopPick: p.isTopPick,
          showOnHome: p.showOnHome,
          isPublished: p.isPublished,
        }}
      />
    </>
  );
}
