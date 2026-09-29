"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save, Trash2 } from "lucide-react";
import { deleteAuthor, saveAuthor, type AuthorInput } from "@/app/admin/_actions/authors";
import { slugify } from "@/lib/utils";
import { ActionButton } from "./ConfirmButton";
import { ImageField } from "./ImageField";
import { toast } from "./toast";
import { Card, Field } from "./ui";

type AuthorData = Required<Omit<AuthorInput, "id">> & { id?: number };

export function AuthorForm({ initial }: { initial: AuthorData }) {
  const router = useRouter();
  const [author, setAuthor] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const isNew = !author.id;

  const set = (patch: Partial<AuthorData>) => setAuthor((a) => ({ ...a, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveAuthor(author);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      setErrors({});
      toast.success(isNew ? "Author created." : "Author saved.");
      if (isNew) router.replace(`/admin/authors/${result.id}/`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card title="Profile">
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="author-name" error={errors.name}>
            <input
              id="author-name"
              value={author.name}
              onChange={(e) => set(isNew ? { name: e.target.value, slug: slugify(e.target.value) } : { name: e.target.value })}
              className="adm-input"
              required
            />
          </Field>
          <Field label="Slug" htmlFor="author-slug" error={errors.slug} hint={`Profile URL: /author/${author.slug || "…"}/`}>
            <input id="author-slug" value={author.slug} onChange={(e) => set({ slug: e.target.value })} className="adm-input font-mono text-[13px]" />
          </Field>
          <Field label="Job title" htmlFor="author-job" className="sm:col-span-2" hint="e.g. Platform Reviewer & Seller Safety Writer">
            <input id="author-job" value={author.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} className="adm-input" />
          </Field>
          <Field label="Bio" htmlFor="author-bio" className="sm:col-span-2" hint="Shown in the author box under every article and on the author page.">
            <textarea id="author-bio" rows={5} value={author.bio} onChange={(e) => set({ bio: e.target.value })} className="adm-input" />
          </Field>
          <Field label="Website" htmlFor="author-website" error={errors.website}>
            <input id="author-website" type="url" value={author.website} onChange={(e) => set({ website: e.target.value })} className="adm-input" placeholder="https://" />
          </Field>
          <Field label="X (Twitter)" htmlFor="author-twitter" error={errors.twitter}>
            <input id="author-twitter" type="url" value={author.twitter} onChange={(e) => set({ twitter: e.target.value })} className="adm-input" placeholder="https://x.com/…" />
          </Field>
          <Field label="Instagram" htmlFor="author-instagram" error={errors.instagram}>
            <input id="author-instagram" type="url" value={author.instagram} onChange={(e) => set({ instagram: e.target.value })} className="adm-input" placeholder="https://instagram.com/…" />
          </Field>
          <Field label="LinkedIn" htmlFor="author-linkedin" error={errors.linkedin}>
            <input id="author-linkedin" type="url" value={author.linkedin} onChange={(e) => set({ linkedin: e.target.value })} className="adm-input" placeholder="https://linkedin.com/in/…" />
          </Field>
        </div>
      </Card>

      <div className="space-y-5">
        <Card title="Photo">
          <div className="p-5">
            <ImageField value={author.avatar} onChange={({ url }) => set({ avatar: url })} showAlt={false} aspect="square" label="Add photo" />
          </div>
        </Card>
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
            {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
            {isNew ? "Create author" : "Save author"}
          </button>
          {!isNew && (
            <ActionButton
              className="adm-btn-danger"
              action={() => deleteAuthor(author.id!)}
              confirm="Delete this author? Their posts will be kept without an author."
              success="Author deleted."
              redirectTo="/admin/authors/"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </ActionButton>
          )}
        </div>
      </div>
    </form>
  );
}
