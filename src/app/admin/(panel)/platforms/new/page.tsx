import { PlatformForm } from "@/components/admin/PlatformForm";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "Add platform" };

export default async function NewPlatformPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Add platform" back={{ href: "/admin/platforms/", label: "Platforms" }} />
      <PlatformForm
        initial={{
          name: "",
          slug: "",
          rating: "4.5",
          score: "",
          bestFor: "",
          payoutSpeed: "",
          sellerCost: "",
          commission: "",
          buyerTraffic: "",
          summary: "",
          websiteUrl: "",
          reviewUrl: "",
          isTopPick: false,
          showOnHome: false,
          isPublished: true,
        }}
      />
    </>
  );
}
