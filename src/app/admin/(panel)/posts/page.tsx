import Image from "next/image";
import Link from "next/link";
import { ExternalLink, FilePlus2, FileText, Pencil, Search, Trash2 } from "lucide-react";
import { deletePost } from "@/app/admin/_actions/posts";
import { ActionButton } from "@/components/admin/ConfirmButton";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/ui";
import { ADMIN_PAGE_SIZE, listPosts } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";
import { cn, formatShortDate, isFutureDate } from "@/lib/utils";

export const metadata = { title: "Posts" };

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };

function PostActions({
  post,
  className,
}: {
  post: { id: number; title: string; slug: string; status: string };
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1", className)}>
      <Link href={`/admin/posts/${post.id}/`} className="adm-btn adm-btn-ghost adm-btn-sm" title="Edit">
        <Pencil className="size-3.5" aria-hidden="true" /> Edit
      </Link>
      {post.status === "published" && (
        <a href={`/${post.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm" title="View on site">
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">View</span>
        </a>
      )}
      <ActionButton
        action={deletePost.bind(null, post.id)}
        confirm={`Delete “${post.title}”? This cannot be undone.`}
        success="Post deleted."
        className="adm-btn-ghost adm-btn-sm text-red-600"
        title="Delete"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Delete</span>
      </ActionButton>
    </div>
  );
}

export default async function PostsPage({ searchParams }: Props) {
  await requireUser();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status === "draft" || params.status === "published" ? params.status : "";
  const page = Math.max(1, Number(params.page) || 1);
  const { rows, total } = await listPosts({ q, status, page });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  const href = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q, status, page: undefined, ...patch } as Record<string, string | number | undefined>;
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, String(value));
    const qs = next.toString();
    return `/admin/posts/${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Posts"
        description="Write, edit and publish blog articles."
        actions={
          <Link href="/admin/posts/new/" className="adm-btn adm-btn-primary">
            <FilePlus2 className="size-4" aria-hidden="true" /> New post
          </Link>
        }
      />

      <div className="adm-card @container">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3e8ee] px-4 py-3">
          <nav className="flex gap-1" aria-label="Filter by status">
            {[
              { label: "All", value: "" },
              { label: "Published", value: "published" },
              { label: "Drafts", value: "draft" },
            ].map((tab) => (
              <Link
                key={tab.label}
                href={href({ status: tab.value || undefined })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold",
                  status === tab.value ? "bg-blush text-brand" : "text-muted hover:bg-blush/60 hover:text-ink",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <form action="/admin/posts/" className="relative w-full sm:w-72">
            {status && <input type="hidden" name="status" value={status} />}
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
            <input name="q" defaultValue={q} placeholder="Search posts…" className="adm-input pl-9" aria-label="Search posts" />
          </form>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-6" />}
            title={q || status ? "No posts match your filters." : "No posts yet"}
            text={q || status ? "Try a different search or filter." : "Write your first article to get started."}
            action={
              <Link href="/admin/posts/new/" className="adm-btn adm-btn-primary">
                <FilePlus2 className="size-4" aria-hidden="true" /> New post
              </Link>
            }
          />
        ) : (
          <>
          {/* Narrow card (phones, tablets, laptops with the sidebar): list */}
          <ul className="divide-y divide-[#f3e8ee] @4xl:hidden">
            {rows.map((post) => (
              <li key={post.id} className="flex gap-3 px-4 py-3.5 @xl:items-center @xl:gap-4">
                <Link
                  href={`/admin/posts/${post.id}/`}
                  className="relative h-14 w-20 flex-none overflow-hidden rounded-lg bg-blush @xl:h-16 @xl:w-24"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  {post.featuredImage && <Image src={post.featuredImage} alt="" fill sizes="96px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/posts/${post.id}/`} className="line-clamp-2 leading-snug font-semibold text-ink hover:text-brand">
                    {post.title || "(untitled)"}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-subtle">
                    <StatusBadge status={post.status} publishedAt={post.publishedAt} />
                    {post.categoryName && <span>{post.categoryName}</span>}
                    <span>
                      {formatShortDate(post.status === "published" && post.publishedAt ? post.publishedAt : post.updatedAt)}
                    </span>
                  </div>
                  <div className="@xl:hidden">
                    <PostActions post={post} className="mt-2 -ml-2.5" />
                  </div>
                </div>
                <div className="hidden flex-none @xl:block">
                  <PostActions post={post} />
                </div>
              </li>
            ))}
          </ul>

          {/* Wide card: table (fixed columns, so long titles and slugs truncate instead of widening it) */}
          <div className="relative hidden overflow-x-auto @4xl:block">
            <table className="adm-table min-w-[760px] table-fixed">
              <thead>
                <tr>
                  <th>Title</th>
                  <th className="w-[130px]">Status</th>
                  <th className="w-[160px]">Category</th>
                  <th className="w-[125px]">Date</th>
                  <th className="w-[170px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-16 flex-none overflow-hidden rounded-lg bg-blush">
                          {post.featuredImage && <Image src={post.featuredImage} alt="" fill sizes="64px" className="object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/posts/${post.id}/`}
                            title={post.title}
                            className="line-clamp-1 font-semibold text-ink hover:text-brand"
                          >
                            {post.title || "(untitled)"}
                          </Link>
                          <p className="truncate text-xs text-subtle">/{post.slug}/</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={post.status} publishedAt={post.publishedAt} />
                    </td>
                    <td className="text-muted">{post.categoryName ?? "—"}</td>
                    <td className="text-xs whitespace-nowrap text-muted">
                      {post.status === "published" && post.publishedAt ? (
                        <>
                          {isFutureDate(post.publishedAt) ? "Scheduled" : "Published"}
                          <br />
                          {formatShortDate(post.publishedAt)}
                        </>
                      ) : (
                        <>
                          Edited
                          <br />
                          {formatShortDate(post.updatedAt)}
                        </>
                      )}
                    </td>
                    <td>
                      <PostActions post={post} className="justify-end" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#f3e8ee] px-4 py-3 text-sm">
            <span className="text-subtle">
              Page {page} of {totalPages} · {total} posts
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={href({ page: page - 1 })} className="adm-btn adm-btn-secondary adm-btn-sm">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={href({ page: page + 1 })} className="adm-btn adm-btn-secondary adm-btn-sm">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
