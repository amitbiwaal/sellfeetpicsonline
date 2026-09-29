"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "./toast";

type Result = { ok: true } | { ok: false; error: string };

/** Runs a server action after an optional confirmation, then refreshes or redirects. */
export function ActionButton({
  action,
  confirm,
  success,
  redirectTo,
  className,
  children,
  title,
}: {
  action: () => Promise<Result>;
  confirm?: string;
  success?: string;
  redirectTo?: string;
  className?: string;
  children: React.ReactNode;
  title?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      className={cn("adm-btn", className)}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        startTransition(async () => {
          try {
            const result = await action();
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            if (success) toast.success(success);
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
          } catch {
            toast.error("Something went wrong. Please try again.");
          }
        });
      }}
    >
      {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
