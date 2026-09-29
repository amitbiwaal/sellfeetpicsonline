"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Check, Copy, ImageUp, LoaderCircle, Search, Trash2, UploadCloud } from "lucide-react";
import { deleteMedia, getMediaUsage, listMedia, updateMediaAlt } from "@/app/admin/_actions/media";
import type { Media } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { toast } from "./toast";

const PAGE = 40;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function uploadFiles(files: File[]) {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const res = await fetch("/api/admin/media/", { method: "POST", body });
  const data = (await res.json().catch(() => null)) as { ok: boolean; items?: Media[]; errors?: string[]; error?: string } | null;
  if (!data) throw new Error("Upload failed. Please try again.");
  return data;
}

type Props = {
  mode?: "manage" | "pick";
  onPick?: (item: Media) => void;
  /** First page rendered on the server, so the library shows instantly. */
  initial?: { items: Media[]; total: number };
};

export function MediaLibrary({ mode = "manage", onPick, initial }: Props) {
  const [items, setItems] = useState<Media[]>(initial?.items ?? []);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!initial);
  const skipFirstLoad = useRef(Boolean(initial));
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [alt, setAlt] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLElement>(null);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const load = useCallback(async (q: string, offset = 0) => {
    setLoading(true);
    try {
      const result = await listMedia({ q, offset, limit: PAGE });
      setItems((prev) => (offset ? [...prev, ...result.items] : result.items));
      setTotal(result.total);
    } catch {
      toast.error("Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipFirstLoad.current) {
      skipFirstLoad.current = false;
      return;
    }
    const timer = setTimeout(() => void load(query), query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, load]);

  function select(item: Media) {
    setSelectedId(item.id);
    setAlt(item.alt);
    setCopied(false);
    // On small screens the details panel sits below the grid: bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!files.length) {
      toast.error("Please choose image files (JPG, PNG, WebP, GIF or AVIF).");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadFiles(files);
      result.errors?.forEach((e) => toast.error(e));
      if (result.items?.length) {
        setItems((prev) => [...result.items!, ...prev]);
        setTotal((t) => t + result.items!.length);
        select(result.items[0]);
        toast.success(result.items.length === 1 ? "Image uploaded." : `${result.items.length} images uploaded.`);
      } else if (result.error && !result.errors?.length) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function saveAlt() {
    if (!selected) return;
    startTransition(async () => {
      const result = await updateMediaAlt(selected.id, alt);
      if (result.ok) {
        setItems((prev) => prev.map((i) => (i.id === selected.id ? { ...i, alt: alt.trim() } : i)));
        toast.success("Alt text saved.");
      } else toast.error(result.error);
    });
  }

  async function remove() {
    if (!selected) return;
    const usage = await getMediaUsage(selected.id).catch(() => [] as string[]);
    const message = usage.length
      ? `This image is used in:\n• ${usage.slice(0, 8).join("\n• ")}${usage.length > 8 ? `\n…and ${usage.length - 8} more` : ""}\n\nDelete it anyway? Those places will show a broken image.`
      : "Delete this image? This cannot be undone.";
    if (!window.confirm(message)) return;
    startTransition(async () => {
      const result = await deleteMedia(selected.id);
      if (result.ok) {
        setItems((prev) => prev.filter((i) => i.id !== selected.id));
        setTotal((t) => t - 1);
        setSelectedId(null);
        toast.success("Image deleted.");
      } else toast.error(result.error);
    });
  }

  async function copyUrl() {
    if (!selected) return;
    const url = selected.url.startsWith("/") ? `${window.location.origin}${selected.url}` : selected.url;
    await navigator.clipboard.writeText(url).catch(() => window.prompt("Copy this URL:", url));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="relative"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
      }}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-brand bg-blush/90">
          <p className="flex items-center gap-2 font-semibold text-brand">
            <UploadCloud className="size-5" aria-hidden="true" /> Drop images to upload
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file name or alt text…"
            className="adm-input pl-9"
            aria-label="Search media"
          />
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
        <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} className="adm-btn adm-btn-primary">
          {uploading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ImageUp className="size-4" aria-hidden="true" />}
          {uploading ? "Uploading…" : "Upload images"}
        </button>
      </div>

      <p className="mb-3 text-xs text-subtle">
        Drag &amp; drop images anywhere here. Photos are resized, converted to WebP and stripped of location data
        automatically.
      </p>

      <div className={cn("grid grid-cols-1 gap-5", selected && "lg:grid-cols-[minmax(0,1fr)_300px]")}>
        <div>
          {!loading && items.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-line px-6 py-16 text-center">
              <UploadCloud className="mx-auto size-8 text-brand" aria-hidden="true" />
              <p className="mt-3 font-semibold text-ink">{query ? "No images match your search." : "No images yet."}</p>
              <p className="mt-1 text-sm text-muted">Upload your first image to get started.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 xl:grid-cols-5">
              {items.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => select(item)}
                    onDoubleClick={() => mode === "pick" && onPick?.(item)}
                    className={cn(
                      "group relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-blush transition",
                      selectedId === item.id ? "border-brand ring-4 ring-blush-soft" : "border-transparent hover:border-brand-light",
                    )}
                    title={item.filename}
                  >
                    <Image src={item.url} alt={item.alt} fill sizes="200px" loading={index < 10 ? "eager" : "lazy"} className="object-cover" />
                    {selectedId === item.id && (
                      <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-brand text-white">
                        <Check className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {loading && (
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-subtle">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Loading…
            </p>
          )}
          {!loading && items.length < total && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => void load(query, items.length)} className="adm-btn adm-btn-secondary">
                Load more ({total - items.length} more)
              </button>
            </div>
          )}
        </div>

        {selected && (
          <aside ref={detailsRef} className="adm-card h-fit scroll-mt-20 p-4 lg:sticky lg:top-6">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-blush">
              <Image src={selected.url} alt={selected.alt} fill sizes="300px" className="object-contain" />
            </div>
            <p className="mt-3 truncate text-sm font-semibold text-ink" title={selected.filename}>
              {selected.filename}
            </p>
            <p className="text-xs text-subtle">
              {selected.width && selected.height ? `${selected.width} × ${selected.height}px · ` : ""}
              {formatBytes(selected.size)}
            </p>

            <label htmlFor="media-alt" className="adm-label mt-4">
              Alt text
            </label>
            <textarea
              id="media-alt"
              rows={2}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="adm-input text-sm"
              placeholder="Describe the image for search engines and screen readers"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={saveAlt} disabled={pending || alt === selected.alt} className="adm-btn adm-btn-secondary adm-btn-sm">
                Save alt text
              </button>
              <button type="button" onClick={copyUrl} className="adm-btn adm-btn-ghost adm-btn-sm">
                {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                {copied ? "Copied" : "Copy URL"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#f3e8ee] pt-4">
              {mode === "pick" && (
                <button type="button" onClick={() => onPick?.({ ...selected, alt: alt.trim() || selected.alt })} className="adm-btn adm-btn-primary flex-1">
                  Use this image
                </button>
              )}
              <button type="button" onClick={remove} disabled={pending} className="adm-btn adm-btn-danger adm-btn-sm">
                <Trash2 className="size-3.5" aria-hidden="true" /> Delete
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
