import { notFound } from "next/navigation";
import { AuthorForm } from "@/components/admin/AuthorForm";
import { PageHeader } from "@/components/admin/ui";
import { getAuthorForEdit } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "Edit author" };

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const author = await getAuthorForEdit(id);
  if (!author) notFound();

  return (
    <>
      <PageHeader title={author.name} back={{ href: "/admin/authors/", label: "Authors" }} />
      <AuthorForm
        key={author.id}
        initial={{
          id: author.id,
          name: author.name,
          slug: author.slug,
          jobTitle: author.jobTitle,
          bio: author.bio,
          avatar: author.avatar,
          website: author.website,
          twitter: author.twitter,
          instagram: author.instagram,
          linkedin: author.linkedin,
        }}
      />
    </>
  );
}
