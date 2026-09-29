import Link from "next/link";
import { ArrowDown, ArrowUp, Home, Pencil, Plus, Star, Trophy } from "lucide-react";
import { movePlatform } from "@/app/admin/_actions/platforms";
import { ActionButton } from "@/components/admin/ConfirmButton";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { listPlatforms } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";
import type { Platform } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export const metadata = { title: "Platforms" };

function Badges({ p }: { p: Platform }) {
  return (
    <div className="flex flex-wrap gap-1">
      {p.isTopPick && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blush-soft px-2 py-0.5 text-[11px] font-bold text-brand">
          <Trophy className="size-3" aria-hidden="true" /> Top pick
        </span>
      )}
      {p.showOnHome && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
          <Home className="size-3" aria-hidden="true" /> Homepage
        </span>
      )}
      {!p.isPublished && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">Hidden</span>}
    </div>
  );
}

function RowActions({ p, className }: { p: Platform; className?: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      <ActionButton action={movePlatform.bind(null, p.id, "up")} className="adm-btn-ghost adm-btn-sm" title="Move up">
        <ArrowUp className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Move up</span>
      </ActionButton>
      <ActionButton action={movePlatform.bind(null, p.id, "down")} className="adm-btn-ghost adm-btn-sm" title="Move down">
        <ArrowDown className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Move down</span>
      </ActionButton>
      <Link href={`/admin/platforms/${p.id}/`} className="adm-btn adm-btn-ghost adm-btn-sm">
        <Pencil className="size-3.5" aria-hidden="true" /> Edit
      </Link>
    </div>
  );
}

function Rating({ p }: { p: Platform }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
      <Star className="size-3.5 fill-star text-star" aria-hidden="true" /> {p.rating.toFixed(1)}
    </span>
  );
}

export default async function PlatformsPage() {
  await requireUser();
  const platforms = await listPlatforms();

  return (
    <>
      <PageHeader
        title="Platforms"
        description="The platforms shown on the homepage and the Best Platforms ranking. Use the arrows to change the ranking order."
        actions={
          <Link href="/admin/platforms/new/" className="adm-btn adm-btn-primary">
            <Plus className="size-4" aria-hidden="true" /> Add platform
          </Link>
        }
      />
      <div className="adm-card">
        {platforms.length === 0 ? (
          <EmptyState icon={<Trophy className="size-6" />} title="No platforms yet" />
        ) : (
          <>
            <ol className="divide-y divide-[#f3e8ee] md:hidden">
              {platforms.map((p, index) => (
                <li key={p.id} className={cn("flex gap-3 px-4 py-3.5", !p.isPublished && "opacity-60")}>
                  <span className="mt-0.5 w-6 flex-none font-serif font-bold text-brand">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/admin/platforms/${p.id}/`} className="font-semibold text-ink hover:text-brand">
                        {p.name}
                      </Link>
                      <span className="flex flex-none items-center gap-2">
                        <Rating p={p} />
                        {p.score != null && <span className="text-xs text-muted">{p.score.toFixed(1)}/10</span>}
                      </span>
                    </div>
                    {p.bestFor && <p className="truncate text-xs text-subtle">{p.bestFor}</p>}
                    <div className="mt-1.5">
                      <Badges p={p} />
                    </div>
                    <RowActions p={p} className="mt-1.5 -ml-2.5" />
                  </div>
                </li>
              ))}
            </ol>

            <div className="relative hidden overflow-x-auto md:block">
              <table className="adm-table min-w-[680px]">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Platform</th>
                    <th>Rating</th>
                    <th>Score</th>
                    <th>Shown</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((p, index) => (
                    <tr key={p.id} className={p.isPublished ? undefined : "opacity-60"}>
                      <td className="font-serif font-bold text-brand">{index + 1}</td>
                      <td>
                        <Link href={`/admin/platforms/${p.id}/`} className="font-semibold text-ink hover:text-brand">
                          {p.name}
                        </Link>
                        <p className="line-clamp-1 max-w-xs text-xs text-subtle">{p.bestFor}</p>
                      </td>
                      <td>
                        <Rating p={p} />
                      </td>
                      <td className="text-muted">{p.score != null ? `${p.score.toFixed(1)}/10` : "—"}</td>
                      <td>
                        <Badges p={p} />
                      </td>
                      <td>
                        <RowActions p={p} className="justify-end" />
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
        Homepage cards are sorted by star rating. The Best Platforms page follows the order above.
      </p>
    </>
  );
}
