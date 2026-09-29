"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { deleteCategory, deleteTag, saveCategory, saveTag } from "@/app/admin/_actions/taxonomy";
import { cn, slugify } from "@/lib/utils";
import { ActionButton } from "./ConfirmButton";
import { toast } from "./toast";
import { Card, Field } from "./ui";

type Item = { id: number; name: string; slug: string; description?: string; postCount: number };
type Kind = "category" | "tag";

const EMPTY = { id: undefined as number | undefined, name: "", slug: "", description: "" };

export function TaxonomyManager({ kind, items }: { kind: Kind; items: Item[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const label = kind === "category" ? "category" : "tag";
  const base = kind === "category" ? "/category" : "/tag";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result =
        kind === "category"
          ? await saveCategory({ id: form.id, name: form.name, slug: form.slug, description: form.description })
          : await saveTag({ id: form.id, name: form.name, slug: form.slug });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success(form.id ? `${label[0].toUpperCase()}${label.slice(1)} updated.` : `${label[0].toUpperCase()}${label.slice(1)} added.`);
      setForm(EMPTY);
      setErrors({});
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <Card title={form.id ? `Edit ${label}` : `Add a new ${label}`} className="h-fit">
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field label="Name" htmlFor="tax-name" error={errors.name}>
            <input
              id="tax-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))}
              className="adm-input"
              required
            />
          </Field>
          <Field label="Slug" htmlFor="tax-slug" error={errors.slug} hint={`URL: ${base}/${form.slug || "…"}/`}>
            <input
              id="tax-slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="adm-input font-mono text-[13px]"
            />
          </Field>
          {kind === "category" && (
            <Field label="Description" htmlFor="tax-description" hint="Shown at the top of the category page and used for SEO.">
              <textarea
                id="tax-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="adm-input"
              />
            </Field>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
              {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
              {form.id ? "Save changes" : `Add ${label}`}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm(EMPTY)} className="adm-btn adm-btn-ghost">
                Cancel
              </button>
            )}
          </div>
        </form>
      </Card>

      <div className="adm-card @container">
        {items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">Nothing here yet.</p>
        ) : (
          <>
          <ul className="divide-y divide-[#f3e8ee] @xl:hidden">
            {items.map((item) => (
              <li key={item.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="truncate font-mono text-xs text-subtle">{item.slug}</p>
                  </div>
                  <span className="flex-none rounded-full bg-blush px-2 py-0.5 text-xs font-semibold text-muted-2">
                    {Number(item.postCount)} posts
                  </span>
                </div>
                {item.description && <p className="mt-1 line-clamp-2 text-xs text-subtle">{item.description}</p>}
                {renderActions(item, "mt-2 -ml-2.5")}
              </li>
            ))}
          </ul>
          <div className="relative hidden overflow-x-auto @xl:block">
          <table className="adm-table min-w-[520px]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Posts</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="font-semibold text-ink">{item.name}</span>
                    {item.description && <p className="line-clamp-1 max-w-sm text-xs text-subtle">{item.description}</p>}
                  </td>
                  <td className="font-mono text-xs text-muted">{item.slug}</td>
                  <td className="text-muted">{Number(item.postCount)}</td>
                  <td>
                    {renderActions(item, "justify-end")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          </>
        )}
      </div>
    </div>
  );

  function renderActions(item: Item, className?: string) {
    return (
      <div className={cn("flex gap-1", className)}>
        <button
          type="button"
          onClick={() => {
            setForm({ id: item.id, name: item.name, slug: item.slug, description: item.description ?? "" });
            setErrors({});
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="adm-btn adm-btn-ghost adm-btn-sm"
        >
          <Pencil className="size-3.5" aria-hidden="true" /> Edit
        </button>
        <a href={`${base}/${item.slug}/`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm" title="View">
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">View</span>
        </a>
        <ActionButton
          action={() => (kind === "category" ? deleteCategory(item.id) : deleteTag(item.id))}
          confirm={`Delete “${item.name}”? Posts will be kept but lose this ${label}.`}
          success="Deleted."
          className="adm-btn-ghost adm-btn-sm text-red-600"
          title="Delete"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Delete</span>
        </ActionButton>
      </div>
    );
  }
}
