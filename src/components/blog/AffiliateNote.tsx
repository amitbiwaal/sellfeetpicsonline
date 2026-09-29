import Link from "next/link";
import { Info } from "lucide-react";

export function AffiliateNote() {
  return (
    <p className="mb-8 flex gap-2.5 rounded-2xl border border-line bg-blush/60 px-4 py-3 text-[13.5px] leading-relaxed text-muted-2">
      <Info className="mt-0.5 size-4 flex-none text-brand" aria-hidden="true" />
      <span>
        Some links in this article may be affiliate links. If you sign up through them we may earn a commission, at no
        extra cost to you. It never affects our rankings.{" "}
        <Link href="/affiliate-disclosure/" className="font-semibold text-brand underline underline-offset-2">
          Learn more
        </Link>
      </span>
    </p>
  );
}
