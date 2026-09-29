import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { listAuthorsWithCounts } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "Authors" };

export default async function AuthorsPage() {
  await requireUser();
  const authors = await listAuthorsWithCounts();

  return (
    <>
      <PageHeader
        title="Authors"
        description="Public author profiles shown on articles. Good author info helps Google trust your content."
        actions={
          <Link href="/admin/authors/new/" className="adm-btn adm-btn-primary">
            <UserPlus className="size-4" aria-hidden="true" /> New author
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {authors.map((author) => (
          <div key={author.id} className="adm-card flex items-center gap-4 p-5">
            <div className="relative size-14 flex-none overflow-hidden rounded-full bg-blush">
              {author.avatar ? (
                <Image src={author.avatar} alt={author.name} fill sizes="56px" className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center font-semibold text-brand">{author.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{author.name}</p>
              <p className="truncate text-xs text-subtle">{author.jobTitle || "No job title"}</p>
              <p className="text-xs text-muted">{Number(author.postCount)} posts</p>
            </div>
            <div className="flex flex-col gap-1">
              <Link href={`/admin/authors/${author.id}/`} className="adm-btn adm-btn-ghost adm-btn-sm">
                <Pencil className="size-3.5" aria-hidden="true" /> Edit
              </Link>
              <a href={`/author/${author.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm">
                <ExternalLink className="size-3.5" aria-hidden="true" /> View
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
