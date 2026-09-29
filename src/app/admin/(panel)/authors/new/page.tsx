import { AuthorForm } from "@/components/admin/AuthorForm";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "New author" };

export default async function NewAuthorPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="New author" back={{ href: "/admin/authors/", label: "Authors" }} />
      <AuthorForm
        initial={{ name: "", slug: "", jobTitle: "", bio: "", avatar: "", website: "", twitter: "", instagram: "", linkedin: "" }}
      />
    </>
  );
}
