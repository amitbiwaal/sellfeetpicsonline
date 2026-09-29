import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <div className="adm-card">
      <EmptyState
        icon={<SearchX className="size-6" />}
        title="Not found"
        text="This item doesn't exist or was deleted."
        action={
          <Link href="/admin/" className="adm-btn adm-btn-primary">
            Back to dashboard
          </Link>
        }
      />
    </div>
  );
}
