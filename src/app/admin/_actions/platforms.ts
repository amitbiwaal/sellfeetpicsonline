"use server";

import { and, asc, eq, max, ne } from "drizzle-orm";
import { z } from "zod";
import { revalidateSite, validationError, type ActionResult } from "@/lib/admin/common";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { platforms } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

const platformSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1, "Please enter a name.").max(80),
  slug: z.string().trim().max(90).default(""),
  rating: z.number().min(0, "Rating must be 0–5.").max(5, "Rating must be 0–5."),
  score: z.number().min(0, "Score must be 0–10.").max(10, "Score must be 0–10.").nullable(),
  bestFor: z.string().trim().max(120).default(""),
  payoutSpeed: z.string().trim().max(80).default(""),
  sellerCost: z.string().trim().max(120).default(""),
  commission: z.string().trim().max(120).default(""),
  buyerTraffic: z.string().trim().max(80).default(""),
  summary: z.string().trim().max(1200).default(""),
  websiteUrl: z
    .string()
    .trim()
    .max(600)
    .refine((v) => !v || /^https?:\/\//i.test(v), "Website must start with http:// or https://")
    .default(""),
  reviewUrl: z
    .string()
    .trim()
    .max(600)
    .refine((v) => !v || v.startsWith("/") || /^https?:\/\//i.test(v), "Use a path like /my-review/ or a full URL")
    .default(""),
  isTopPick: z.boolean().default(false),
  showOnHome: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export type PlatformInput = z.input<typeof platformSchema>;

export async function savePlatform(input: PlatformInput): Promise<ActionResult<{ id: number }>> {
  await requireUser();
  const parsed = platformSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { id, ...data } = parsed.data;
  const slug = slugify(data.slug || data.name);
  if (!slug) return { ok: false, error: "Please enter a valid slug.", fieldErrors: { slug: "Invalid slug" } };

  const clash = await db
    .select({ id: platforms.id })
    .from(platforms)
    .where(id ? and(eq(platforms.slug, slug), ne(platforms.id, id)) : eq(platforms.slug, slug))
    .get();
  if (clash) return { ok: false, error: "Another platform already uses this slug.", fieldErrors: { slug: "Already in use" } };

  // Only one "top pick" at a time.
  if (data.isTopPick) {
    await db
      .update(platforms)
      .set({ isTopPick: false })
      .where(id ? ne(platforms.id, id) : undefined);
  }

  const values = { ...data, slug, updatedAt: new Date() };
  let savedId = id;
  if (id) {
    await db.update(platforms).set(values).where(eq(platforms.id, id));
  } else {
    const last = await db.select({ value: max(platforms.sortOrder) }).from(platforms).get();
    savedId = (
      await db
        .insert(platforms)
        .values({ ...values, sortOrder: (last?.value ?? 0) + 1 })
        .returning({ id: platforms.id })
        .get()
    ).id;
  }

  revalidateSite();
  return { ok: true, id: savedId! };
}

export async function deletePlatform(id: number): Promise<ActionResult> {
  await requireUser();
  await db.delete(platforms).where(eq(platforms.id, id));
  revalidateSite();
  return { ok: true };
}

/** Move a platform up or down in the ranking. */
export async function movePlatform(id: number, direction: "up" | "down"): Promise<ActionResult> {
  await requireUser();
  const list = await db
    .select({ id: platforms.id })
    .from(platforms)
    .orderBy(asc(platforms.sortOrder), asc(platforms.id));
  const index = list.findIndex((p) => p.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= list.length) return { ok: true };

  [list[index], list[target]] = [list[target], list[index]];
  for (const [position, item] of list.entries()) {
    await db.update(platforms).set({ sortOrder: position + 1 }).where(eq(platforms.id, item.id));
  }
  revalidateSite();
  return { ok: true };
}
