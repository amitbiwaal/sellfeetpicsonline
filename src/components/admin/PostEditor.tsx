"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy, ExternalLink, Eye, History, LoaderCircle, Save, Send, Trash2 } from "lucide-react";
import { deletePost, duplicatePost, savePost } from "@/app/admin/_actions/posts";
import { cn, formatDate, isFutureDate, slugify } from "@/lib/utils";
import { ActionButton } from "./ConfirmButton";
import { ImageField } from "./ImageField";
import { RichTextEditor } from "./RichTextEditor";
import { SeoPanel } from "./SeoPanel";
import { TagInput } from "./TagInput";
import { toast } from "./toast";
import { Card, Field, StatusBadge } from "./ui";
import { useDraftBackup } from "./useDraftBackup";
import { useUnsavedChanges } from "./useUnsavedChanges";

export type PostEditorData = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  status: "draft" | "published";
  publishedAt: string | null;
  authorId: number | null;
  categoryId: number | null;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  noindex: boolean;
  updatedAt?: string;
};

type Options = {
  authors: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  tags: string[];
};

/** ISO string → value for <input type="datetime-local"> (local time). */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * The parts a writer edits, as a string, to tell whether a browser backup differs from the saved
 * post. Browser-only: the HTML goes through the DOM so editor and stored markup compare equal.
 */
function editableSnapshot(p: PostEditorData) {
  const template = document.createElement("template");
  template.innerHTML = p.content;
  return JSON.stringify([
    p.title, p.slug, p.excerpt, template.innerHTML, p.featuredImage, p.featuredImageAlt, p.publishedAt,
    p.authorId, p.categoryId, [...p.tags].sort(), p.seoTitle, p.seoDescription, p.noindex,
  ]);
}

/** Date and time in the editor's own time zone, e.g. "Sep 30, 2026, 9:00 AM". */
function formatLocal(iso: string) {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function PostEditor({
  initial,
  options,
  siteName,
  siteHost,
}: {
  initial: PostEditorData;
  options: Options;
  siteName: string;
  siteHost: string;
}) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const saveRef = useRef<(status?: "draft" | "published") => Promise<number | null>>(async () => null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  // Bumped on every edit, so a save only marks the post clean if nothing changed meanwhile.
  const revision = useRef(0);
  // The rich text editor reads its content once; a new key (after restoring a backup) reloads it.
  const [editorSeed, setEditorSeed] = useState({ key: 0, content: initial.content });
  const backup = useDraftBackup<PostEditorData>(`post:${post.id ?? "new"}`, post, dirty, post.updatedAt);
  const backupOffer = backup.offer && editableSnapshot(backup.offer.data) !== editableSnapshot(initial) ? backup.offer : null;

  // Grow the title box with its content (for browsers without field-sizing support).
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [post.title]);

  const isNew = !post.id;
  const hasFutureDate = isFutureDate(post.publishedAt);
  const isScheduled = post.status === "published" && hasFutureDate;

  function update(patch: Partial<PostEditorData>) {
    setPost((p) => ({ ...p, ...patch }));
    setDirty(true);
    revision.current += 1;
  }

  function restoreBackup() {
    const saved = backupOffer?.data;
    if (!saved) return;
    setPost((p) => ({ ...saved, id: p.id, status: p.status, updatedAt: p.updatedAt }));
    setEditorSeed((s) => ({ key: s.key + 1, content: saved.content }));
    setSlugTouched(true);
    setDirty(true);
    revision.current += 1;
    backup.clear();
    toast.success("Unsaved changes restored. Save to keep them.");
  }

  async function save(status: "draft" | "published" = post.status) {
    const startRevision = revision.current;
    const result = await savePost({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      featuredImageAlt: post.featuredImageAlt,
      status,
      publishedAt: post.publishedAt,
      authorId: post.authorId,
      categoryId: post.categoryId,
      tags: post.tags,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      noindex: post.noindex,
    });

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return null;
    }

    setErrors({});
    // Edits made while the request was running still need saving.
    if (revision.current === startRevision) {
      setDirty(false);
      backup.clear();
    }
    setPost((p) => ({
      ...p,
      id: result.id,
      slug: result.slug,
      status,
      publishedAt: p.publishedAt ?? (status === "published" ? new Date().toISOString() : null),
      updatedAt: new Date().toISOString(),
    }));
    setSlugTouched(true);

    const wasPublished = post.status === "published";
    toast.success(
      status === "published"
        ? hasFutureDate
          ? `Post scheduled. It goes live ${formatLocal(post.publishedAt!)}.`
          : wasPublished
            ? "Post updated. Changes are live."
            : "Post published!"
        : wasPublished
          ? "Post moved to drafts."
          : "Draft saved.",
    );
    if (isNew) router.replace(`/admin/posts/${result.id}/`);
    else router.refresh();
    return result.id;
  }

  useEffect(() => {
    saveRef.current = save;
  });

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        startSaving(async () => {
          await saveRef.current();
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useUnsavedChanges(dirty);

  function run(status?: "draft" | "published") {
    startSaving(async () => {
      await save(status);
    });
  }

  /** Save the draft, then open it on the real site in preview mode. */
  function preview() {
    // Open the tab right away (inside the click) so popup blockers allow it.
    const tab = window.open("", "_blank");
    startSaving(async () => {
      const id = dirty || isNew ? await save("draft") : (post.id ?? null);
      if (id && tab) tab.location.href = `/api/admin/preview/?type=post&id=${id}`;
      else tab?.close();
    });
  }

  const liveUrl = `/${post.slug}/`;

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e5eb] bg-[#faf6f8]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/posts/" className="adm-btn adm-btn-ghost adm-btn-sm" aria-label="Back to posts">
            <ChevronLeft className="size-4" aria-hidden="true" /> Posts
          </Link>
          <h1 className="truncate font-serif text-xl font-semibold text-ink">{isNew ? "New post" : "Edit post"}</h1>
          {!isNew && <StatusBadge status={post.status} publishedAt={post.publishedAt} />}
          {dirty && <span className="text-xs font-medium text-amber-600">Unsaved changes</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {post.status === "published" && !isNew ? (
            <>
              {isScheduled ? (
                <a href={`/api/admin/preview/?type=post&id=${post.id}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost">
                  <Eye className="size-4" aria-hidden="true" /> Preview
                </a>
              ) : (
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost">
                  <ExternalLink className="size-4" aria-hidden="true" /> View
                </a>
              )}
              <button type="button" disabled={saving} onClick={() => run("draft")} className="adm-btn adm-btn-secondary">
                Unpublish
              </button>
              <button type="button" disabled={saving} onClick={() => run("published")} className="adm-btn adm-btn-primary">
                {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                Update
              </button>
            </>
          ) : (
            <>
              <button type="button" disabled={saving} onClick={preview} className="adm-btn adm-btn-ghost">
                <Eye className="size-4" aria-hidden="true" /> Preview
              </button>
              <button type="button" disabled={saving} onClick={() => run("draft")} className="adm-btn adm-btn-secondary">
                {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                Save draft
              </button>
              <button type="button" disabled={saving} onClick={() => run("published")} className="adm-btn adm-btn-primary">
                <Send className="size-4" aria-hidden="true" /> {hasFutureDate ? "Schedule" : "Publish"}
              </button>
            </>
          )}
        </div>
      </div>

      {backupOffer && (
        <div role="status" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <History className="size-4 flex-none" aria-hidden="true" />
          <p className="min-w-0 flex-1">
            This browser kept changes from {formatLocal(new Date(backupOffer.savedAt).toISOString())} that were never saved.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={restoreBackup} className="adm-btn adm-btn-primary adm-btn-sm">
              Restore them
            </button>
            <button type="button" onClick={backup.clear} className="adm-btn adm-btn-ghost adm-btn-sm">
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <div className="adm-card p-5">
            <label htmlFor="post-title" className="sr-only">
              Title
            </label>
            <textarea
              ref={titleRef}
              id="post-title"
              rows={1}
              maxLength={200}
              value={post.title}
              onChange={(e) => {
                const title = e.target.value.replace(/\n/g, " ");
                update(slugTouched ? { title } : { title, slug: slugify(title) });
              }}
              placeholder="Add a title"
              aria-invalid={Boolean(errors.title)}
              className="field-sizing-content w-full resize-none border-0 bg-transparent font-serif text-2xl leading-tight font-semibold text-ink outline-none placeholder:text-[#d7c3cd] sm:text-[32px]"
            />
            {errors.title && <p className="text-xs font-medium text-red-600">{errors.title}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-1 text-sm text-subtle">
              <span className="hidden sm:inline">{siteHost}/</span>
              <span className="sm:hidden">URL: /</span>
              <input
                value={post.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                }}
                onBlur={() => update({ slug: slugify(post.slug || post.title) })}
                aria-label="URL slug"
                aria-invalid={Boolean(errors.slug)}
                className={cn(
                  "min-w-0 flex-1 rounded-md border bg-white px-2 py-1 font-mono text-[13px] text-ink outline-none focus:border-brand-light sm:min-w-[200px]",
                  errors.slug ? "border-red-300" : "border-[#eadde4]",
                )}
              />
              <span>/</span>
            </div>
            {errors.slug && <p className="mt-1 text-xs font-medium text-red-600">{errors.slug}</p>}
          </div>

          <RichTextEditor key={editorSeed.key} value={editorSeed.content} onChange={(content) => update({ content })} />

          <Card title="Excerpt" className="p-0">
            <div className="p-5">
              <textarea
                id="post-excerpt"
                rows={3}
                maxLength={500}
                value={post.excerpt}
                onChange={(e) => update({ excerpt: e.target.value })}
                className="adm-input"
                placeholder="A one or two sentence summary shown on blog cards and under the title."
                aria-label="Excerpt"
              />
              <p className="adm-hint">{post.excerpt.length} / 500 characters · shown on blog cards and at the top of the article.</p>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Publishing">
            <div className="space-y-4 p-5">
              <p className="text-sm text-muted" suppressHydrationWarning>
                <span className="font-semibold text-ink">Status: </span>
                {isNew || post.status === "draft"
                  ? "Draft — only visible to logged-in editors."
                  : isScheduled
                    ? `Scheduled — goes live ${formatLocal(post.publishedAt!)}.`
                    : "Published — live on the site."}
              </p>
              <Field label="Publish date" htmlFor="post-date" hint="Pick a future date to schedule the post.">
                <input
                  id="post-date"
                  type="datetime-local"
                  value={toLocalInput(post.publishedAt)}
                  onChange={(e) => update({ publishedAt: fromLocalInput(e.target.value) })}
                  className="adm-input"
                />
              </Field>
              {post.updatedAt && <p className="text-xs text-subtle">Last saved {formatDate(post.updatedAt)}</p>}
            </div>
          </Card>

          <Card title="Featured image">
            <div className="p-5">
              <ImageField
                value={post.featuredImage}
                alt={post.featuredImageAlt}
                onChange={({ url, alt }) => update({ featuredImage: url, featuredImageAlt: alt })}
                label="Choose featured image"
              />
            </div>
          </Card>

          <Card title="Organize">
            <div className="space-y-4 p-5">
              <Field label="Category" htmlFor="post-category">
                <select
                  id="post-category"
                  value={post.categoryId ?? ""}
                  onChange={(e) => update({ categoryId: e.target.value ? Number(e.target.value) : null })}
                  className="adm-input"
                >
                  <option value="">No category</option>
                  {options.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Author" htmlFor="post-author">
                <select
                  id="post-author"
                  value={post.authorId ?? ""}
                  onChange={(e) => update({ authorId: e.target.value ? Number(e.target.value) : null })}
                  className="adm-input"
                >
                  <option value="">No author</option>
                  {options.authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div>
                <span className="adm-label">Tags</span>
                <TagInput value={post.tags} onChange={(tags) => update({ tags })} suggestions={options.tags} />
              </div>
            </div>
          </Card>

          <Card title="SEO">
            <div className="p-5">
              <SeoPanel
                title={post.seoTitle}
                description={post.seoDescription}
                noindex={post.noindex}
                fallbackTitle={post.title}
                fallbackDescription={post.excerpt}
                path={liveUrl}
                siteName={siteName}
                siteHost={siteHost}
                onChange={(patch) => update(patch)}
              />
            </div>
          </Card>

          {!isNew && (
            <Card title="More actions">
              <div className="flex flex-wrap gap-2 p-5">
                <ActionButton
                  className="adm-btn-secondary adm-btn-sm"
                  action={async () => {
                    const result = await duplicatePost(post.id!);
                    if (result.ok) router.push(`/admin/posts/${result.id}/`);
                    return result;
                  }}
                  success="Copy created as a draft."
                >
                  <Copy className="size-3.5" aria-hidden="true" /> Duplicate
                </ActionButton>
                <ActionButton
                  className="adm-btn-danger adm-btn-sm"
                  action={() => deletePost(post.id!)}
                  confirm="Delete this post permanently? This cannot be undone."
                  success="Post deleted."
                  redirectTo="/admin/posts/"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" /> Delete post
                </ActionButton>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
