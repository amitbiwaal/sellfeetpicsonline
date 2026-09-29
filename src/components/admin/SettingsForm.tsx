"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw, Save } from "lucide-react";
import { clearSiteCache, saveSettings } from "@/app/admin/_actions/settings";
import type { SiteSettings } from "@/lib/settings";
import { ActionButton } from "./ConfirmButton";
import { toast } from "./toast";
import { Card, Field } from "./ui";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const set = (key: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSettings(values);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      setErrors({});
      toast.success("Settings saved. The website has been updated.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card title="General">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <Field label="Site name" htmlFor="s-name" error={errors.site_name}>
            <input id="s-name" value={values.site_name} onChange={set("site_name")} className="adm-input" />
          </Field>
          <Field label="Footer note" htmlFor="s-footer" error={errors.footer_note}>
            <input id="s-footer" value={values.footer_note} onChange={set("footer_note")} className="adm-input" />
          </Field>
          <Field label="Tagline" htmlFor="s-tagline" className="md:col-span-2" error={errors.tagline} hint="Shown in the footer and used in the RSS feed.">
            <textarea id="s-tagline" rows={2} value={values.tagline} onChange={set("tagline")} className="adm-input" />
          </Field>
        </div>
      </Card>

      <Card title="Contact">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <Field label="Public contact email" htmlFor="s-email" error={errors.contact_email} hint="Shown on the Contact page and in the legal pages.">
            <input id="s-email" type="email" value={values.contact_email} onChange={set("contact_email")} className="adm-input" />
          </Field>
          <Field
            label="Send contact form notifications to"
            htmlFor="s-notify"
            error={errors.notify_email}
            hint="Optional. Needs email sending set up (see README). Defaults to the public email."
          >
            <input id="s-notify" type="email" value={values.notify_email} onChange={set("notify_email")} className="adm-input" />
          </Field>
        </div>
      </Card>

      <Card title="Analytics">
        <div className="p-5">
          <Field
            label="Google Analytics 4 Measurement ID"
            htmlFor="s-ga"
            error={errors.ga_measurement_id}
            hint="e.g. G-ABC123XYZ. Leave empty to disable. Visitors are asked for consent before analytics loads."
          >
            <input id="s-ga" value={values.ga_measurement_id} onChange={set("ga_measurement_id")} className="adm-input max-w-sm font-mono" placeholder="G-XXXXXXXXXX" />
          </Field>
        </div>
      </Card>

      <Card title="Social profiles">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          {(
            [
              ["social_x", "X (Twitter)"],
              ["social_instagram", "Instagram"],
              ["social_tiktok", "TikTok"],
              ["social_pinterest", "Pinterest"],
              ["social_reddit", "Reddit"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label} htmlFor={`s-${key}`} error={errors[key]}>
              <input id={`s-${key}`} type="url" value={values[key]} onChange={set(key)} className="adm-input" placeholder="https://" />
            </Field>
          ))}
        </div>
        <p className="px-5 pb-5 text-xs text-subtle">Filled-in profiles appear as icons in the footer and in Google&apos;s organization data.</p>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
          {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
          Save settings
        </button>
        <ActionButton action={clearSiteCache} success="Cache cleared. Pages will rebuild on their next visit." className="adm-btn-secondary">
          <RefreshCw className="size-4" aria-hidden="true" /> Clear site cache
        </ActionButton>
      </div>
    </form>
  );
}
