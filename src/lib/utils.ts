/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** URL-safe slug: "Fun With Feet Reviews!" -> "fun-with-feet-reviews". */
export function slugify(input: string, maxLength = 90) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date | string | number | null | undefined) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? "" : dateFormatter.format(d);
}

export function formatShortDate(date: Date | string | number | null | undefined) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? "" : shortDateFormatter.format(d);
}

/** True when the date is later than right now (e.g. a scheduled post). */
export function isFutureDate(date: Date | string | number | null | undefined) {
  if (date == null) return false;
  const time = new Date(date).getTime();
  return Number.isFinite(time) && time > Date.now();
}

export function toIsoString(date: Date | string | number | null | undefined) {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#039;": "'",
  "&nbsp;": " ",
  "&#8217;": "’",
  "&#8216;": "‘",
  "&#8220;": "“",
  "&#8221;": "”",
  "&#8211;": "–",
  "&#8212;": "—",
  "&#8230;": "…",
  "&hellip;": "…",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&ndash;": "–",
  "&mdash;": "—",
};

export function decodeEntities(text: string) {
  return text
    .replace(/&(?:[a-z]+|#\d+);/gi, (entity) => {
      const mapped = ENTITY_MAP[entity.toLowerCase()];
      if (mapped) return mapped;
      const numeric = /^&#(\d+);$/.exec(entity);
      return numeric ? String.fromCodePoint(Number(numeric[1])) : entity;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    );
}

/** Plain text from an HTML string (good enough for excerpts and counts). */
export function stripHtml(html: string) {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/(p|h[1-6]|li|td|th|blockquote|div)>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:!?-]+$/, "")}…`;
}

export function countWords(html: string) {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).length : 0;
}

/** Estimated reading time in minutes (225 wpm, minimum 1). */
export function readingMinutes(html: string) {
  return Math.max(1, Math.round(countWords(html) / 225));
}

export function isExternalUrl(href: string, siteUrl: string) {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    return new URL(href).host !== new URL(siteUrl).host;
  } catch {
    return true;
  }
}

/** Ensure internal paths end with a slash (the site uses trailing slashes). */
export function withTrailingSlash(path: string) {
  if (!path.startsWith("/") || path.includes("?") || path.includes("#")) return path;
  if (/\.[a-z0-9]+$/i.test(path)) return path;
  return path.endsWith("/") ? path : `${path}/`;
}
