import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { getSettings } from "@/lib/data/settings";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Settings" description="Site-wide details used across the website." />
      <SettingsForm initial={settings} />
    </>
  );
}
