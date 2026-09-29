import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { PageHeader } from "@/components/admin/ui";
import { listMediaItems } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "Media" };

export default async function MediaPage() {
  await requireUser();
  const initial = await listMediaItems({ limit: 40 });
  return (
    <>
      <PageHeader title="Media library" description="Upload and manage images for posts, pages and authors." />
      <div className="adm-card p-5">
        <MediaLibrary mode="manage" initial={initial} />
      </div>
    </>
  );
}
