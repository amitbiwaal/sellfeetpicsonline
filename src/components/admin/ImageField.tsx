"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { MediaPickerDialog } from "./MediaPickerDialog";

type Props = {
  value: string;
  alt?: string;
  onChange: (value: { url: string; alt: string }) => void;
  showAlt?: boolean;
  aspect?: "video" | "square";
  label?: string;
};

export function ImageField({ value, alt = "", onChange, showAlt = true, aspect = "video", label = "Choose image" }: Props) {
  const [open, setOpen] = useState(false);
  const altId = useId();

  return (
    <div>
      {value ? (
        <div>
          <div className={aspect === "square" ? "relative aspect-square w-32 overflow-hidden rounded-full border border-line bg-blush" : "relative aspect-[3/2] overflow-hidden rounded-xl border border-line bg-blush"}>
            <Image src={value} alt={alt} fill sizes="320px" className="object-cover" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen(true)} className="adm-btn adm-btn-secondary adm-btn-sm">
              <RefreshCw className="size-3.5" aria-hidden="true" /> Replace
            </button>
            <button type="button" onClick={() => onChange({ url: "", alt: "" })} className="adm-btn adm-btn-ghost adm-btn-sm">
              <Trash2 className="size-3.5" aria-hidden="true" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            aspect === "square"
              ? "flex size-32 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-line text-sm font-semibold text-muted-2 hover:border-brand-light hover:text-brand"
              : "flex aspect-[3/2] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-sm font-semibold text-muted-2 transition-colors hover:border-brand-light hover:bg-blush/50 hover:text-brand"
          }
        >
          <ImagePlus className="size-6" aria-hidden="true" />
          {label}
        </button>
      )}

      {showAlt && value && (
        <div className="mt-3">
          <label htmlFor={altId} className="adm-label">
            Alt text
          </label>
          <input
            id={altId}
            value={alt}
            onChange={(e) => onChange({ url: value, alt: e.target.value })}
            className="adm-input"
            placeholder="Describe the image"
          />
        </div>
      )}

      <MediaPickerDialog open={open} onClose={() => setOpen(false)} onPick={(item) => onChange({ url: item.url, alt: alt || item.alt })} />
    </div>
  );
}
