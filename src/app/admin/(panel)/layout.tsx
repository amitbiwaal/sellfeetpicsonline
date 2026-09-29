import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { countUnreadMessages } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await countUnreadMessages();

  return (
    <div className="lg:flex">
      <AdminSidebar user={user} unreadMessages={unread} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1240px]">{children}</div>
      </main>
    </div>
  );
}
