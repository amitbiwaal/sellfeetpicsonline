"use server";

import { z } from "zod";
import { revalidateSite, validationError, type ActionResult } from "@/lib/admin/common";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { SETTING_KEYS, type SiteSettings } from "@/lib/settings";

const url = z
  .string()
  .trim()
  .max(300)
  .refine((v) => !v || /^https?:\/\//i.test(v), "Links must start with https://");

const settingsSchema = z.object({
  site_name: z.string().trim().min(1, "Site name is required.").max(80),
  tagline: z.string().trim().max(200),
  contact_email: z.string().trim().email("Please enter a valid contact email."),
  notify_email: z.string().trim().max(160).refine((v) => !v || z.string().email().safeParse(v).success, "Please enter a valid email."),
  footer_note: z.string().trim().max(160),
  ga_measurement_id: z
    .string()
    .trim()
    .max(40)
    .refine((v) => !v || /^G-[A-Z0-9]+$/i.test(v), "Use a GA4 Measurement ID like G-XXXXXXXXXX."),
  social_x: url,
  social_instagram: url,
  social_tiktok: url,
  social_pinterest: url,
  social_reddit: url,
});

export async function saveSettings(input: SiteSettings): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  for (const key of SETTING_KEYS) {
    const value = parsed.data[key];
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  revalidateSite();
  return { ok: true };
}

/** Rebuild every public page on its next visit. */
export async function clearSiteCache(): Promise<ActionResult> {
  await requireUser();
  revalidateSite();
  return { ok: true };
}
