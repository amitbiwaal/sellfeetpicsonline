import sanitize from "sanitize-html";
import { HTMLElement, parse } from "node-html-parser";
import { isExternalUrl, slugify } from "@/lib/utils";

const TEXT_ALIGN = [/^(left|right|center|justify)$/];

const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "h5", "h6", "strong", "em", "u", "s", "del",
    "mark", "sup", "sub", "small", "a", "ul", "ol", "li", "blockquote", "hr",
    "code", "pre", "img", "figure", "figcaption", "table", "thead", "tbody",
    "tfoot", "tr", "th", "td", "caption", "colgroup", "col", "div", "span",
    "iframe", "details", "summary",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title", "name"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    col: ["span"],
    ol: ["start", "type"],
    iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "frameborder", "loading"],
    "*": ["class", "id", "style"],
  },
  allowedStyles: { "*": { "text-align": TEXT_ALIGN } },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  allowedIframeHostnames: [
    "www.youtube.com",
    "youtube.com",
    "www.youtube-nocookie.com",
    "player.vimeo.com",
  ],
  transformTags: { h1: "h2", b: "strong", i: "em", strike: "s" },
  exclusiveFilter: (frame) =>
    frame.tag === "p" && !frame.text.replace(/ /g, " ").trim() && !frame.mediaChildren.length,
};

/** Clean untrusted/editor HTML before it is stored. */
export function sanitizeContent(html: string) {
  return sanitize(html ?? "", SANITIZE_OPTIONS).trim();
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

type PrepareOptions = {
  siteUrl: string;
  /** Replaces {{key}} placeholders, e.g. {{contact_email}}. */
  tokens?: Record<string, string>;
};

export function replaceTokens(html: string, tokens: Record<string, string> = {}) {
  return html.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(tokens, key.toLowerCase())
      ? tokens[key.toLowerCase()]
      : match,
  );
}

/**
 * Prepare stored HTML for display: heading anchors (+ table of contents),
 * lazy images, safe external links and scrollable tables.
 */
export function prepareContent(html: string, { siteUrl, tokens }: PrepareOptions) {
  const root = parse(replaceTokens(html ?? "", tokens), {
    comment: false,
    blockTextElements: { pre: true },
  });

  const toc: TocItem[] = [];
  const usedIds = new Map<string, number>();

  for (const heading of root.querySelectorAll("h2, h3")) {
    const text = heading.text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const base = heading.getAttribute("id") || slugify(text, 70) || "section";
    const seen = usedIds.get(base) ?? 0;
    usedIds.set(base, seen + 1);
    const id = seen ? `${base}-${seen + 1}` : base;
    heading.setAttribute("id", id);
    toc.push({ id, text, level: heading.tagName === "H2" ? 2 : 3 });
  }

  for (const img of root.querySelectorAll("img")) {
    if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    if (!img.hasAttribute("alt")) img.setAttribute("alt", "");
  }

  for (const link of root.querySelectorAll("a")) {
    const href = link.getAttribute("href") ?? "";
    if (isExternalUrl(href, siteUrl)) {
      const rel = new Set((link.getAttribute("rel") ?? "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.setAttribute("rel", [...rel].join(" "));
      link.setAttribute("target", "_blank");
    } else if (href.startsWith(siteUrl)) {
      link.setAttribute("href", href.slice(siteUrl.length) || "/");
    }
  }

  for (const table of root.querySelectorAll("table")) {
    const parent = table.parentNode as HTMLElement | null;
    if (parent?.classList?.contains("table-wrap")) continue;

    // Tables with a header row become stacked "label: value" cards on phones.
    const rows = table.querySelectorAll("tr");
    const headRow = rows.find((row) => {
      const cells = row.childNodes.filter((n): n is HTMLElement => n instanceof HTMLElement && /^(TD|TH)$/.test(n.tagName));
      return cells.length > 1 && cells.every((cell) => cell.tagName === "TH");
    });
    let stack = false;
    if (headRow && rows.length > 1) {
      const labels = headRow.querySelectorAll("th").map((th) => th.text.replace(/\s+/g, " ").trim());
      headRow.classList.add("head-row");
      for (const row of rows) {
        if (row === headRow) continue;
        row.querySelectorAll("td, th").forEach((cell, index) => {
          if (labels[index]) cell.setAttribute("data-label", labels[index]);
        });
      }
      table.classList.add("stack-sm");
      stack = true;
    }

    // Outer box (fade hint) + inner scroller, so wide tables swipe sideways when not stacked.
    table.replaceWith(
      `<div class="table-scroll${stack ? " stack-sm" : ""}"><div class="table-wrap">${table.outerHTML}</div></div>`,
    );
  }

  for (const frame of root.querySelectorAll("iframe")) {
    const parent = frame.parentNode as HTMLElement | null;
    if (parent?.classList?.contains("embed")) continue;
    if (!frame.getAttribute("loading")) frame.setAttribute("loading", "lazy");
    frame.replaceWith(`<div class="embed">${frame.outerHTML}</div>`);
  }

  return { html: root.toString(), toc };
}
