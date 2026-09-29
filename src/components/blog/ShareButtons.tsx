"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
    { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Share2 className="size-4 text-brand" aria-hidden="true" /> Share
      </span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-muted-2 transition-colors hover:border-brand-light hover:bg-blush hover:text-brand"
        >
          {link.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-muted-2 transition-colors hover:border-brand-light hover:bg-blush hover:text-brand"
      >
        {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Link2 className="size-3.5" aria-hidden="true" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
