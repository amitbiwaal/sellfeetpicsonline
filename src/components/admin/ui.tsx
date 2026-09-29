import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn, isFutureDate } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-subtle hover:text-brand">
            <ChevronLeft className="size-4" aria-hidden="true" /> {back.label}
          </Link>
        )}
        <h1 className="font-serif text-[28px] leading-tight font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, title, actions }: { children: React.ReactNode; className?: string; title?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("adm-card", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-[#f3e8ee] px-5 py-3.5">
          {title && <h2 className="text-sm font-bold text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** Draft / Published, or Scheduled for published posts whose date is still in the future. */
export function StatusBadge({ status, publishedAt }: { status: string; publishedAt?: Date | string | null }) {
  const published = status === "published";
  const scheduled = published && isFutureDate(publishedAt);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        scheduled ? "bg-blue-50 text-blue-700" : published ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700",
      )}
    >
      <span className={cn("size-1.5 rounded-full", scheduled ? "bg-blue-500" : published ? "bg-green-500" : "bg-amber-500")} />
      {scheduled ? "Scheduled" : published ? "Published" : "Draft"}
    </span>
  );
}

export function EmptyState({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-blush text-brand">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="adm-label">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : hint ? <p className="adm-hint">{hint}</p> : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  id: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-5 w-9 rounded-full bg-[#e8d8e0] transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand-light" />
        <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && <span className="block text-xs text-subtle">{description}</span>}
      </span>
    </label>
  );
}
