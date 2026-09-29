"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";

export function TagInput({
  value,
  onChange,
  suggestions = [],
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}) {
  const [input, setInput] = useState("");
  const listId = useId();

  function add(raw: string) {
    const parts = raw
      .split(",")
      .map((t) => t.trim().slice(0, 60).trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const part of parts) {
      if (next.length >= 40) break;
      if (!next.some((t) => t.toLowerCase() === part.toLowerCase())) next.push(part);
    }
    onChange(next);
    setInput("");
  }

  return (
    <div>
      <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-[10px] border border-[#e8d8e0] bg-white px-2 py-1.5 focus-within:border-brand-light focus-within:ring-[3px] focus-within:ring-blush-soft">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-brand-dark">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove tag ${tag}`} className="text-subtle hover:text-brand">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          list={listId}
          value={input}
          onChange={(e) => {
            if (e.target.value.endsWith(",")) add(e.target.value);
            else setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
            } else if (e.key === "Backspace" && !input && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => add(input)}
          placeholder={value.length ? "" : "Add tags…"}
          className="min-w-[100px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
          aria-label="Add a tag"
        />
      </div>
      <datalist id={listId}>
        {suggestions
          .filter((s) => !value.includes(s))
          .map((s) => (
            <option key={s} value={s} />
          ))}
      </datalist>
      <p className="adm-hint">Press Enter or comma to add a tag.</p>
    </div>
  );
}
