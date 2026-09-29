"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save, Trash2 } from "lucide-react";
import { deletePlatform, savePlatform } from "@/app/admin/_actions/platforms";
import { slugify } from "@/lib/utils";
import { ActionButton } from "./ConfirmButton";
import { toast } from "./toast";
import { Card, Field, Toggle } from "./ui";

export type PlatformData = {
  id?: number;
  name: string;
  slug: string;
  rating: string;
  score: string;
  bestFor: string;
  payoutSpeed: string;
  sellerCost: string;
  commission: string;
  buyerTraffic: string;
  summary: string;
  websiteUrl: string;
  reviewUrl: string;
  isTopPick: boolean;
  showOnHome: boolean;
  isPublished: boolean;
};

export function PlatformForm({ initial }: { initial: PlatformData }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const isNew = !data.id;
  const set = (patch: Partial<PlatformData>) => setData((d) => ({ ...d, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await savePlatform({
        ...data,
        rating: Number(data.rating) || 0,
        score: data.score.trim() === "" ? null : Number(data.score),
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      setErrors({});
      toast.success(isNew ? "Platform added." : "Platform saved.");
      if (isNew) router.replace(`/admin/platforms/${result.id}/`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Card title="Details">
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="pf-name" error={errors.name}>
              <input
                id="pf-name"
                value={data.name}
                onChange={(e) => set(isNew ? { name: e.target.value, slug: slugify(e.target.value) } : { name: e.target.value })}
                className="adm-input"
                required
              />
            </Field>
            <Field label="Slug" htmlFor="pf-slug" error={errors.slug}>
              <input id="pf-slug" value={data.slug} onChange={(e) => set({ slug: e.target.value })} className="adm-input font-mono text-[13px]" />
            </Field>
            <Field label="Star rating (0–5)" htmlFor="pf-rating" error={errors.rating} hint="Shown as stars on the homepage cards.">
              <input id="pf-rating" type="number" step="0.1" min="0" max="5" value={data.rating} onChange={(e) => set({ rating: e.target.value })} className="adm-input" />
            </Field>
            <Field label="Our score (0–10, optional)" htmlFor="pf-score" error={errors.score} hint="Shown on the Best Platforms page.">
              <input id="pf-score" type="number" step="0.1" min="0" max="10" value={data.score} onChange={(e) => set({ score: e.target.value })} className="adm-input" />
            </Field>
            <Field label="Best for" htmlFor="pf-bestfor" hint="Short label, e.g. “Beginners”.">
              <input id="pf-bestfor" value={data.bestFor} onChange={(e) => set({ bestFor: e.target.value })} className="adm-input" />
            </Field>
            <Field label="Payout speed" htmlFor="pf-payout" hint="e.g. “7–14 days”. Leave empty if unknown.">
              <input id="pf-payout" value={data.payoutSpeed} onChange={(e) => set({ payoutSpeed: e.target.value })} className="adm-input" />
            </Field>
            <Field label="Seller cost" htmlFor="pf-cost">
              <input id="pf-cost" value={data.sellerCost} onChange={(e) => set({ sellerCost: e.target.value })} className="adm-input" />
            </Field>
            <Field label="Commission" htmlFor="pf-commission">
              <input id="pf-commission" value={data.commission} onChange={(e) => set({ commission: e.target.value })} className="adm-input" />
            </Field>
            <Field label="Buyer traffic" htmlFor="pf-traffic">
              <input id="pf-traffic" value={data.buyerTraffic} onChange={(e) => set({ buyerTraffic: e.target.value })} className="adm-input" />
            </Field>
            <Field label="Summary" htmlFor="pf-summary" className="sm:col-span-2" hint="Two or three honest sentences for the Best Platforms page.">
              <textarea id="pf-summary" rows={4} value={data.summary} onChange={(e) => set({ summary: e.target.value })} className="adm-input" />
            </Field>
          </div>
        </Card>

        <Card title="Links">
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <Field
              label="Review link"
              htmlFor="pf-review"
              error={errors.reviewUrl}
              hint="Your article about it, e.g. /fun-with-feet-reviews/"
            >
              <input id="pf-review" value={data.reviewUrl} onChange={(e) => set({ reviewUrl: e.target.value })} className="adm-input" />
            </Field>
            <Field
              label="Website / affiliate link"
              htmlFor="pf-website"
              error={errors.websiteUrl}
              hint="Adds a “Visit” button (marked as sponsored)."
            >
              <input id="pf-website" type="url" value={data.websiteUrl} onChange={(e) => set({ websiteUrl: e.target.value })} className="adm-input" placeholder="https://" />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Visibility">
          <div className="space-y-4 p-5">
            <Toggle id="pf-published" checked={data.isPublished} onChange={(v) => set({ isPublished: v })} label="Published" description="Show on the Best Platforms page." />
            <Toggle id="pf-home" checked={data.showOnHome} onChange={(v) => set({ showOnHome: v })} label="Show on homepage" description="Adds a card to “Best sites to sell feet online”." />
            <Toggle id="pf-top" checked={data.isTopPick} onChange={(v) => set({ isTopPick: v })} label="Top pick" description="Only one platform can be the top pick." />
          </div>
        </Card>
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
            {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
            {isNew ? "Add platform" : "Save platform"}
          </button>
          {!isNew && (
            <ActionButton
              className="adm-btn-danger"
              action={() => deletePlatform(data.id!)}
              confirm="Delete this platform?"
              success="Platform deleted."
              redirectTo="/admin/platforms/"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </ActionButton>
          )}
        </div>
      </div>
    </form>
  );
}
