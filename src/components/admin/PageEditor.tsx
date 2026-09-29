"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink, Eye, LoaderCircle, Save, Trash2 } from "lucide-react";
import { deletePage, savePage } from "@/app/admin/_actions/pages";
import { cn, slugify } from "@/lib/utils";
import { ActionButton } from "./ConfirmButton";
import { RichTextEditor } from "./RichTextEditor";
import { SeoPanel } from "./SeoPanel";
import { toast } from "./toast";
import { Card, Field, StatusBadge, Toggle } from "./ui";
import { useUnsavedChanges } from "./useUnsavedChanges";

export type PageEditorData = {
  id?: number;
  title: string;
  slug: string;
  intro: string;
  content: string;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
  noindex: boolean;
  showInFooter: boolean;
};

export function PageEditor({ initial, siteName, siteHost }: { initial: PageEditorData; siteName: string; siteHost: string }) {
  const router = useRouter();
  const [page, setPage] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const saveRef = useRef<() => Promise<number | null>>(async () => null);
  const isNew = !page.id;

  function update(patch: Partial<PageEditorData>) {
    setPage((p) => ({ ...p, ...patch }));
    setDirty(true);
  }

  async function save(status: "draft" | "published" = page.status) {
    const result = await savePage({ ...page, status });
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return null;
    }
    setErrors({});
    setDirty(false);
    setSlugTouched(true);
    setPage((p) => ({ ...p, id: result.id, slug: result.slug, status }));
    toast.success(status === "published" ? "Page saved and live." : "Draft saved.");
    if (isNew) router.replace(`/admin/pages/${result.id}/`);
    else router.refresh();
    return result.id;
  }

  useEffect(() => {
    saveRef.current = () => save();
  });

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

  function preview() {
    const tab = window.open("", "_blank");
    startSaving(async () => {
      const id = dirty || isNew ? await save("draft") : (page.id ?? null);
      if (id && tab) tab.location.href = `/api/admin/preview/?type=page&id=${id}`;
      else tab?.close();
    });
  }

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e5eb] bg-[#faf6f8]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/pages/" className="adm-btn adm-btn-ghost adm-btn-sm">
            <ChevronLeft className="size-4" aria-hidden="true" /> Pages
          </Link>
          <h1 className="truncate font-serif text-xl font-semibold text-ink">{isNew ? "New page" : "Edit page"}</h1>
          {!isNew && <StatusBadge status={page.status} />}
          {dirty && <span className="text-xs font-medium text-amber-600">Unsaved changes</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {page.status === "published" && !isNew ? (
            <>
              <a href={`/${page.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost">
                <ExternalLink className="size-4" aria-hidden="true" /> View
              </a>
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
                Save draft
              </button>
              <button type="button" disabled={saving} onClick={() => run("published")} className="adm-btn adm-btn-primary">
                {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                Publish
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <div className="adm-card p-5">
            <input
              value={page.title}
              onChange={(e) => {
                const title = e.target.value;
                update(slugTouched ? { title } : { title, slug: slugify(title) });
              }}
              placeholder="Page title"
              aria-label="Title"
              className="w-full border-0 bg-transparent font-serif text-2xl leading-tight font-semibold text-ink outline-none placeholder:text-[#d7c3cd] sm:text-[32px]"
            />
            {errors.title && <p className="text-xs font-medium text-red-600">{errors.title}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-1 text-sm text-subtle">
              <span className="hidden sm:inline">{siteHost}/</span>
              <span className="sm:hidden">URL: /</span>
              <input
                value={page.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                }}
                onBlur={() => update({ slug: slugify(page.slug || page.title) })}
                aria-label="URL slug"
                className={cn(
                  "min-w-0 flex-1 rounded-md border bg-white px-2 py-1 font-mono text-[13px] text-ink outline-none focus:border-brand-light sm:min-w-[200px]",
                  errors.slug ? "border-red-300" : "border-[#eadde4]",
                )}
              />
              <span>/</span>
            </div>
            {errors.slug && <p className="mt-1 text-xs font-medium text-red-600">{errors.slug}</p>}
            <Field label="Intro" htmlFor="page-intro" className="mt-4" hint="Short text shown under the title.">
              <textarea id="page-intro" rows={2} maxLength={400} value={page.intro} onChange={(e) => update({ intro: e.target.value })} className="adm-input" />
            </Field>
          </div>

          <RichTextEditor value={initial.content} onChange={(content) => update({ content })} placeholder="Write the page content…" />
          <p className="text-xs text-subtle">
            Tip: you can use <code className="rounded bg-blush px-1">{"{{contact_email}}"}</code>,{" "}
            <code className="rounded bg-blush px-1">{"{{site_name}}"}</code> and <code className="rounded bg-blush px-1">{"{{site_url}}"}</code>{" "}
            — they are replaced with the values from Settings.
          </p>
        </div>

        <div className="space-y-5">
          <Card title="Page settings">
            <div className="space-y-4 p-5">
              <p className="text-sm text-muted">
                <span className="font-semibold text-ink">Status: </span>
                {isNew || page.status === "draft" ? "Draft — only visible to logged-in editors." : "Published — live on the site."}
              </p>
              <Toggle
                id="page-footer"
                checked={page.showInFooter}
                onChange={(showInFooter) => update({ showInFooter })}
                label="Show in footer"
                description="Adds a link under “Company” in the site footer."
              />
            </div>
          </Card>

          <Card title="SEO">
            <div className="p-5">
              <SeoPanel
                title={page.seoTitle}
                description={page.seoDescription}
                noindex={page.noindex}
                fallbackTitle={page.title}
                fallbackDescription={page.intro}
                path={`/${page.slug}/`}
                siteName={siteName}
                siteHost={siteHost}
                onChange={(patch) => update(patch)}
              />
            </div>
          </Card>

          {!isNew && (
            <Card title="Danger zone">
              <div className="p-5">
                <ActionButton
                  className="adm-btn-danger adm-btn-sm"
                  action={() => deletePage(page.id!)}
                  confirm="Delete this page permanently?"
                  success="Page deleted."
                  redirectTo="/admin/pages/"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" /> Delete page
                </ActionButton>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
