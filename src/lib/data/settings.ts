import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { SETTINGS_DEFAULTS, isSettingKey, type SiteSettings } from "@/lib/settings";

/** All site settings, with defaults for anything not saved yet. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.select().from(settings);
  const result: SiteSettings = { ...SETTINGS_DEFAULTS };
  for (const row of rows) {
    if (isSettingKey(row.key)) result[row.key] = row.value;
  }
  return result;
});
