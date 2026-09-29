import { AccountForms, TeamManager } from "@/components/admin/UsersManager";
import { PageHeader } from "@/components/admin/ui";
import { listUsers } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requireUser();
  const users = me.role === "admin" ? await listUsers() : [];

  return (
    <>
      <PageHeader title="Users" description="Your login details and who can access this admin panel." />
      <AccountForms key={`${me.name}-${me.email}`} me={{ name: me.name, email: me.email }} />
      {me.role === "admin" && (
        <div className="mt-10">
          <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Team</h2>
          <TeamManager users={users} meId={me.id} />
        </div>
      )}
    </>
  );
}
