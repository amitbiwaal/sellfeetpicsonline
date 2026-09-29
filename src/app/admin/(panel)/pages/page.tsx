import Link from "next/link";
import { ExternalLink, FilePlus2, Files, Pencil } from "lucide-react";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/ui";
import { listPages } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";
import { cn, formatShortDate } from "@/lib/utils";

export const metadata = { title: "Pages" };

function PageActions({ page, className }: { page: { id: number; slug: string; status: string }; className?: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      <Link href={`/admin/pages/${page.id}/`} className="adm-btn adm-btn-ghost adm-btn-sm">
        <Pencil className="size-3.5" aria-hidden="true" /> Edit
      </Link>
      {page.status === "published" && (
        <a href={`/${page.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm" title="View">
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">View</span>
        </a>
      )}
    </div>
  );
}

export default async function PagesListPage() {
  await requireUser();
  const pages = await listPages();

  return (
    <>
      <PageHeader
        title="Pages"
        description="Legal pages and other simple pages, shown at yoursite.com/page-name/."
        actions={
          <Link href="/admin/pages/new/" className="adm-btn adm-btn-primary">
            <FilePlus2 className="size-4" aria-hidden="true" /> New page
          </Link>
        }
      />
      <div className="adm-card">
        {pages.length === 0 ? (
          <EmptyState icon={<Files className="size-6" />} title="No pages yet" />
        ) : (
          <>
            <ul className="divide-y divide-[#f3e8ee] md:hidden">
              {pages.map((page) => (
                <li key={page.id} className="px-4 py-3.5">
                  <Link href={`/admin/pages/${page.id}/`} className="font-semibold text-ink hover:text-brand">
                    {page.title}
                  </Link>
                  <p className="truncate text-xs text-subtle">/{page.slug}/</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-subtle">
                    <StatusBadge status={page.status} />
                    {page.showInFooter && <span>In footer</span>}
                    <span>Updated {formatShortDate(page.updatedAt)}</span>
                  </div>
                  <PageActions page={page} className="mt-2 -ml-2.5" />
                </li>
              ))}
            </ul>

            <div className="relative hidden overflow-x-auto md:block">
              <table className="adm-table min-w-[620px]">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>In footer</th>
                    <th>Updated</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id}>
                      <td>
                        <Link href={`/admin/pages/${page.id}/`} className="font-semibold text-ink hover:text-brand">
                          {page.title}
                        </Link>
                        <p className="text-xs text-subtle">/{page.slug}/</p>
                      </td>
                      <td>
                        <StatusBadge status={page.status} />
                      </td>
                      <td className="text-muted">{page.showInFooter ? "Yes" : "—"}</td>
                      <td className="text-xs text-muted">{formatShortDate(page.updatedAt)}</td>
                      <td>
                        <PageActions page={page} className="justify-end" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <p className="mt-4 text-xs text-subtle">
        The Home, About, Contact, Blog, Best Platforms and Safety Tips pages are built into the site design. Platform
        details can be edited under Platforms and site-wide details under Settings.
      </p>
    </>
  );
}
