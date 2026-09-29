"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Leave draft preview mode and return to the page being viewed. */
export async function exitPreview(formData: FormData) {
  const draft = await draftMode();
  draft.disable();
  const path = String(formData.get("path") ?? "/");
  redirect(path.startsWith("/") && !path.startsWith("//") ? path : "/");
}
