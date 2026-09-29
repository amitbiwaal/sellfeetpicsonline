const BLOCK_TAGS = new Set([
  "P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "TABLE", "DIV", "BLOCKQUOTE", "PRE", "HR", "FIGURE", "BR",
]);

function isBlankText(node: Node | null) {
  return node?.nodeType === Node.TEXT_NODE && !node.textContent?.trim();
}

function neighbour(node: Node, direction: "previousSibling" | "nextSibling") {
  let current = node[direction];
  while (current && isBlankText(current)) current = current[direction];
  return current;
}

function isBlockOrEdge(node: Node | null) {
  return !node || (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has((node as Element).tagName));
}

/**
 * Tidy HTML pasted from Google Docs or Word before the editor reads it.
 * Blank lines between blocks arrive as bare <br> tags or empty paragraphs and would
 * otherwise show up as empty lines in the article.
 */
export function cleanPastedHtml(html: string) {
  if (typeof DOMParser === "undefined") return html;
  const body = new DOMParser().parseFromString(html, "text/html").body;

  // Google Docs wraps everything in <b style="font-weight:normal" id="docs-internal-guid-…">.
  body.querySelectorAll('b[id^="docs-internal-guid"]').forEach((wrapper) => wrapper.replaceWith(...Array.from(wrapper.childNodes)));

  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as Element;
    if (el.tagName === "BR") {
      // Keep line breaks inside text ("line one<br>line two"), drop the ones between blocks.
      if (isBlockOrEdge(neighbour(el, "previousSibling")) && isBlockOrEdge(neighbour(el, "nextSibling"))) el.remove();
    } else if (el.tagName === "P" && !el.textContent?.replace(/ /g, " ").trim() && !el.querySelector("img, iframe")) {
      el.remove();
    }
  }
  return body.innerHTML;
}
