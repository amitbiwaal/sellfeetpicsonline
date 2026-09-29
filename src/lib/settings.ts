import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/** Editable site settings (Admin → Settings) with their defaults. */
export const SETTINGS_DEFAULTS = {
  site_name: SITE_NAME,
  tagline: SITE_TAGLINE,
  contact_email: "contact@sellfeetonline.com",
  notify_email: "",
  footer_note: "Made with care for safe earners.",
  ga_measurement_id: "",
  social_x: "",
  social_instagram: "",
  social_tiktok: "",
  social_pinterest: "",
  social_reddit: "",
};

export type SettingKey = keyof typeof SETTINGS_DEFAULTS;
export type SiteSettings = Record<SettingKey, string>;

export const SETTING_KEYS = Object.keys(SETTINGS_DEFAULTS) as SettingKey[];

export function isSettingKey(key: string): key is SettingKey {
  return Object.prototype.hasOwnProperty.call(SETTINGS_DEFAULTS, key);
}

/** Values used to fill {{placeholders}} in CMS pages. */
export function contentTokens(settings: SiteSettings, siteUrl: string) {
  return {
    site_name: settings.site_name,
    site_url: siteUrl,
    contact_email: settings.contact_email,
  };
}
