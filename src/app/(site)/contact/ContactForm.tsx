"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleCheck, LoaderCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitContact, type ContactState } from "./actions";

const MAX_MESSAGE = 1000;

function Field({
  label,
  name,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-ink">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-[13px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-subtle focus:border-brand-light focus:ring-4 focus:ring-blush-soft";

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(submitContact, { status: "idle" });
  const [length, setLength] = useState(0);
  const startedAtRef = useRef<HTMLInputElement>(null);

  // Record when the form became interactive (used to filter out instant bot submissions).
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center py-10 text-center" role="status">
        <span className="flex size-16 items-center justify-center rounded-full bg-blush-soft text-brand">
          <CircleCheck className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-serif text-2xl font-semibold text-ink">Message sent</h2>
        <p className="mt-2 max-w-sm text-muted">{state.message}</p>
      </div>
    );
  }

  const errors = state.errors ?? {};
  const values = state.values;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="First name" name="name" error={errors.name} required>
          <input
            id="name"
            name="name"
            autoComplete="given-name"
            required
            defaultValue={values?.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(inputClass, errors.name ? "border-red-300" : "border-line")}
          />
        </Field>
        <Field label="Email address" name="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={values?.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(inputClass, errors.email ? "border-red-300" : "border-line")}
          />
        </Field>
      </div>

      <Field label="Phone number (optional)" name="phone" error={errors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={values?.phone}
          aria-invalid={Boolean(errors.phone)}
          className={cn(inputClass, errors.phone ? "border-red-300" : "border-line")}
        />
      </Field>

      <Field label="Message" name="message" error={errors.message} required>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={MAX_MESSAGE}
          defaultValue={values?.message}
          onChange={(e) => setLength(e.target.value.length)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : "message-count"}
          className={cn(inputClass, "min-h-[140px] resize-y", errors.message ? "border-red-300" : "border-line")}
        />
        <p id="message-count" className="mt-1 text-right text-xs text-subtle">
          {length} / {MAX_MESSAGE}
        </p>
      </Field>

      {/* Honeypot: hidden from people, tempting for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedAtRef} type="hidden" name="started_at" defaultValue="" />

      <p className="text-xs leading-relaxed text-subtle">
        Please don&apos;t send photos, ID documents or payment details. By sending this form you agree to our{" "}
        <Link href="/privacy-policy/" className="font-semibold text-brand underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>

      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            Send message <Send className="size-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
