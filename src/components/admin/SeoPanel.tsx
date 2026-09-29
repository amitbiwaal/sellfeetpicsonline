"use client";

import { cn, truncate } from "@/lib/utils";
import { Toggle } from "./ui";

function Counter({ length, ideal }: { length: number; ideal: [number, number] }) {
  const tone = length === 0 ? "text-subtle" : length < ideal[0] ? "text-amber-600" : length <= ideal[1] ? "text-green-600" : "text-red-600";
  return <span className={cn("text-xs font-semibold", tone)}>{length} / {ideal[1]}</span>;
}

type Props = {
  title: string;
  description: string;
  noindex: boolean;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  siteName: string;
  siteHost: string;
  onChange: (value: { seoTitle?: string; seoDescription?: string; noindex?: boolean }) => void;
};

export function SeoPanel({ title, description, noindex, fallbackTitle, fallbackDescription, path, siteName, siteHost, onChange }: Props) {
  const shownTitle = title || `${fallbackTitle || "Untitled"} - ${siteName}`;
  const shownDescription = description || fallbackDescription;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="seo-title" className="adm-label mb-0">
            SEO title
          </label>
          <Counter length={title.length} ideal={[30, 60]} />
        </div>
        <input
          id="seo-title"
          maxLength={200}
          value={title}
          onChange={(e) => onChange({ seoTitle: e.target.value })}
          className="adm-input"
          placeholder={`${fallbackTitle || "Post title"} - ${siteName}`}
        />
        <p className="adm-hint">Leave empty to use the post title. Custom titles are used exactly as written.</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="seo-description" className="adm-label mb-0">
            Meta description
          </label>
          <Counter length={description.length} ideal={[120, 158]} />
        </div>
        <textarea
          id="seo-description"
          rows={3}
          maxLength={320}
          value={description}
          onChange={(e) => onChange({ seoDescription: e.target.value })}
          className="adm-input"
          placeholder={fallbackDescription || "A short summary shown in Google results (120–158 characters)."}
        />
      </div>

      <div className="rounded-xl border border-[#eee] bg-white p-3.5">
        <p className="mb-1 text-[11px] font-bold tracking-wide text-subtle uppercase">Google preview</p>
        <p className="truncate text-xs text-[#4d5156]">
          {siteHost} › {path.replace(/^\/|\/$/g, "") || "…"}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[17px] leading-snug text-[#1a0dab]">{truncate(shownTitle, 62)}</p>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#4d5156]">
          {shownDescription ? truncate(shownDescription, 160) : "Add a meta description to control this text."}
        </p>
      </div>

      <Toggle
        id="seo-noindex"
        checked={noindex}
        onChange={(value) => onChange({ noindex: value })}
        label="Hide from search engines"
        description="Adds noindex. The page stays visible to visitors."
      />
    </div>
  );
}
