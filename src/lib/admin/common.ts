import "server-only";
import { revalidatePath } from "next/cache";
import type { z } from "zod";

export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Returned (instead of redirecting to the login page) by the editors' save actions,
 * so a writer whose session ended doesn't lose what is still on screen.
 */
export const SESSION_ENDED_ERROR =
  "You have been logged out. Log in again in a new tab, then save here — your changes are still on this page.";

/** Purge every cached public page so edits show up immediately. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

/** Turn a failed zod parse into an ActionResult error. */
export function validationError(error: z.ZodError): { ok: false; error: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return { ok: false, error: error.issues[0]?.message ?? "Please check the form.", fieldErrors };
}

export function toDateOrNull(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
