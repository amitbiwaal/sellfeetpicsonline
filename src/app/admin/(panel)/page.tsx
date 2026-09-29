import Link from "next/link";
import { FilePlus2, FileText, Image as ImageIcon, Inbox, PenLine, Send, Upload } from "lucide-react";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { getDashboardStats, listRecentMessages, listRecentPosts } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";
import { formatShortDate, truncate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const [stats, recentPosts, recentMessages] = await Promise.all([
    getDashboardStats(),
    listRecentPosts(6),
    listRecentMessages(5),
  ]);

  const cards = [
    { label: "Published posts", value: stats.published, icon: Send, href: "/admin/posts/?status=published" },
    { label: "Drafts", value: stats.drafts, icon: PenLine, href: "/admin/posts/?status=draft" },
    { label: "Unread messages", value: stats.unreadMessages, icon: Inbox, href: "/admin/messages/?filter=unread" },
    { label: "Media files", value: stats.media, icon: ImageIcon, href: "/admin/media/" },
  ];

  return (
    <>
      {denied && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          That section is only available to admins.
        </p>
      )}
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's what's happening on SellFeetOnline."
        actions={
          <>
            <Link href="/admin/media/" className="adm-btn adm-btn-secondary">
              <Upload className="size-4" aria-hidden="true" /> Upload media
            </Link>
            <Link href="/admin/posts/new/" className="adm-btn adm-btn-primary">
              <FilePlus2 className="size-4" aria-hidden="true" /> New post
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="adm-card group flex flex-col items-start gap-3 p-4 transition-shadow hover:shadow-pink-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <span className="flex size-10 flex-none items-center justify-center rounded-xl sm:size-12 sm:rounded-2xl bg-blush text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-serif text-2xl leading-none sm:text-3xl font-semibold text-ink">{value}</span>
              <span className="mt-1 block text-sm text-muted">{label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card
          title="Recently edited posts"
          actions={
            <Link href="/admin/posts/" className="text-sm font-semibold text-brand hover:text-brand-dark">
              All posts →
            </Link>
          }
        >
          {recentPosts.length ? (
            <ul className="divide-y divide-[#f6edf1]">
              {recentPosts.map((post) => (
                <li key={post.id} className="flex items-center gap-3 px-5 py-3">
                  <FileText className="size-4 flex-none text-subtle" aria-hidden="true" />
                  <Link href={`/admin/posts/${post.id}/`} className="min-w-0 flex-1 truncate font-medium text-ink hover:text-brand">
                    {post.title}
                  </Link>
                  <StatusBadge status={post.status} publishedAt={post.publishedAt} />
                  <span className="hidden w-24 text-right text-xs text-subtle sm:block">{formatShortDate(post.updatedAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-sm text-muted">No posts yet.</p>
          )}
        </Card>

        <Card
          title="Latest messages"
          actions={
            <Link href="/admin/messages/" className="text-sm font-semibold text-brand hover:text-brand-dark">
              Inbox →
            </Link>
          }
        >
          {recentMessages.length ? (
            <ul className="divide-y divide-[#f6edf1]">
              {recentMessages.map((message) => (
                <li key={message.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">
                      {!message.isRead && <span className="mr-1.5 inline-block size-2 rounded-full bg-brand-bright align-middle" />}
                      {message.name}
                    </p>
                    <span className="flex-none text-xs text-subtle">{formatShortDate(message.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">{truncate(message.message, 90)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-sm text-muted">No messages yet. Contact form submissions will appear here.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-bold text-ink">How publishing works</h2>
        <ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-muted md:grid-cols-3">
          <li>• Save a post as a <strong className="text-ink">Draft</strong> to keep it private. Use Preview to see it on the site.</li>
          <li>• Switch to <strong className="text-ink">Published</strong> and save: the post goes live immediately.</li>
          <li>• Set a future publish date to schedule a post (it appears within an hour of that time).</li>
        </ul>
      </Card>
    </>
  );
}
