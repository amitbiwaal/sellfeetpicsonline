"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidateSite, SESSION_ENDED_ERROR, validationError, type ActionResult } from "@/lib/admin/common";
import { slugProblem } from "@/lib/admin/slugs";
import { getCurrentUser, requireUser } from "@/lib/auth/dal";
import { sanitizeContent } from "@/lib/content/html";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

const pageSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(1, "Please add a title.").max(200),
  slug: z.string().trim().max(120).default(""),
  intro: z.string().trim().max(400).default(""),
  content: z.string().max(3_000_000).default(""),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(200).default(""),
  seoDescription: z.string().trim().max(320).default(""),
  noindex: z.boolean().default(false),
  showInFooter: z.boolean().default(false),
});

export type PageInput = z.input<typeof pageSchema>;

export async function savePage(input: PageInput): Promise<ActionResult<{ id: number; slug: string }>> {
  if (!(await getCurrentUser())) return { ok: false, error: SESSION_ENDED_ERROR };
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;

  const slug = slugify(data.slug || data.title);
  const problem = await slugProblem(slug, { type: "page", id: data.id });
  if (problem) return { ok: false, error: problem, fieldErrors: { slug: problem } };

  const values = {
    title: data.title,
    slug,
    intro: data.intro,
    content: sanitizeContent(data.content),
    status: data.status,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    noindex: data.noindex,
    showInFooter: data.showInFooter,
    updatedAt: new Date(),
  };

  let id = data.id;
  if (id) {
    const existing = await db.select({ id: pages.id }).from(pages).where(eq(pages.id, id)).get();
    if (!existing) return { ok: false, error: "This page no longer exists." };
    await db.update(pages).set(values).where(eq(pages.id, id));
  } else {
    id = (await db.insert(pages).values(values).returning({ id: pages.id }).get()).id;
  }

  revalidateSite();
  return { ok: true, id, slug };
}

export async function deletePage(id: number): Promise<ActionResult> {
  await requireUser();
  await db.delete(pages).where(eq(pages.id, id));
  revalidateSite();
  return { ok: true };
}
