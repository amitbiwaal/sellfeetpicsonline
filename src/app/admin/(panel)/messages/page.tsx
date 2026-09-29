import Link from "next/link";
import { CheckCheck, Inbox } from "lucide-react";
import { markAllMessagesRead } from "@/app/admin/_actions/messages";
import { ActionButton } from "@/components/admin/ConfirmButton";
import { MessagesList } from "@/components/admin/MessagesList";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { ADMIN_PAGE_SIZE, listMessages } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";
import { getSettings } from "@/lib/data/settings";
import { cn } from "@/lib/utils";

export const metadata = { title: "Messages" };

type Props = { searchParams: Promise<{ filter?: string; page?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  await requireUser();
  const params = await searchParams;
  const filter = params.filter === "unread" ? "unread" : "";
  const page = Math.max(1, Number(params.page) || 1);
  const [{ rows, total }, settings] = await Promise.all([listMessages({ filter, page }), getSettings()]);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const link = (p: number) => `/admin/messages/?${new URLSearchParams({ ...(filter ? { filter } : {}), page: String(p) })}`;

  return (
    <>
      <PageHeader
        title="Messages"
        description="Messages sent through the contact form."
        actions={
          <ActionButton action={markAllMessagesRead} success="All messages marked as read." className="adm-btn-secondary">
            <CheckCheck className="size-4" aria-hidden="true" /> Mark all read
          </ActionButton>
        }
      />
      <nav className="mb-4 flex gap-1" aria-label="Filter messages">
        {[
          { label: "All", value: "" },
          { label: "Unread", value: "unread" },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/messages/?filter=${tab.value}` : "/admin/messages/"}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold",
              filter === tab.value ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="adm-card">
          <EmptyState icon={<Inbox className="size-6" />} title={filter ? "No unread messages" : "No messages yet"} text="Messages from the contact form will show up here." />
        </div>
      ) : (
        <MessagesList messages={rows} siteName={settings.site_name} />
      )}

      {totalPages > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {page > 1 && (
            <Link href={link(page - 1)} className="adm-btn adm-btn-secondary adm-btn-sm">
              Previous
            </Link>
          )}
          <span className="px-2 py-1.5 text-sm text-subtle">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={link(page + 1)} className="adm-btn adm-btn-secondary adm-btn-sm">
              Next
            </Link>
          )}
        </div>
      )}
      <p className="mt-6 text-xs text-subtle">
        Want an email for every new message? Set RESEND_API_KEY and MAIL_FROM in your environment (see README). Messages
        are always saved here either way.
      </p>
    </>
  );
}
