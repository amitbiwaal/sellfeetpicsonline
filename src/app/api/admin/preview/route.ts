import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { pages, posts } from "@/lib/db/schema";

/** Opens a post or page (including drafts) in preview mode: /api/admin/preview/?type=post&id=1 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login/");

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  const type = searchParams.get("type") === "page" ? "page" : "post";
  if (!Number.isInteger(id) || id <= 0) return new Response("Invalid id", { status: 400 });

  const table = type === "page" ? pages : posts;
  const row = await db.select({ slug: table.slug }).from(table).where(eq(table.id, id)).get();
  if (!row) return new Response("Not found", { status: 404 });

  const draft = await draftMode();
  draft.enable();
  redirect(`/${row.slug}/`);
}
