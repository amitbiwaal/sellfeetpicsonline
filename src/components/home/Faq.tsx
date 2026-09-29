"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import type { FaqItem } from "@/content/home-faq";
import { cn } from "@/lib/utils";

/** Accordion: one answer open at a time (answers may contain simple links). */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = open === index;
        const buttonId = `${baseId}-q${index}`;
        const panelId = `${baseId}-a${index}`;
        return (
          <div
            key={item.question}
            className={cn(
              "rounded-2xl border bg-white transition-[border-color,box-shadow] duration-300",
              isOpen ? "border-[#f0c0d5] shadow-pink-sm" : "border-line-2 hover:border-[#f0c0d5]",
            )}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left font-serif text-[17px] leading-snug font-semibold text-ink-2 sm:px-6 sm:text-lg"
              >
                {item.question}
                <span
                  className={cn(
                    "flex size-8 flex-none items-center justify-center rounded-full transition duration-300",
                    isOpen ? "bg-gradient-brand rotate-45 text-white" : "bg-blush-soft text-brand-hot",
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-open={isOpen}
              className="sfo-faq-panel"
            >
              <div className="overflow-hidden">
                <p
                  className="px-5 pb-5 text-[15.5px] leading-relaxed text-body sm:px-6 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
