"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { login, type LoginState } from "@/app/admin/_actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="email" className="adm-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className="adm-input py-2.5"
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="password" className="adm-label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="adm-input py-2.5 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-subtle hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={pending} className="adm-btn adm-btn-primary w-full py-3 text-[15px]">
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
