"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle, Trash2, UserPlus } from "lucide-react";
import { changeOwnPassword, createUser, deleteUser, resetUserPassword, updateProfile } from "@/app/admin/_actions/users";
import { cn, formatShortDate } from "@/lib/utils";
import { ActionButton } from "./ConfirmButton";
import { toast } from "./toast";
import { Card, Field } from "./ui";

type UserRow = { id: number; name: string; email: string; role: "admin" | "editor"; lastLoginAt: Date | null };

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
      {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function AccountForms({ me }: { me: { name: string; email: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState(me);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingProfile, startProfile] = useTransition();
  const [savingPassword, startPassword] = useTransition();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card title="Your profile">
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            startProfile(async () => {
              const result = await updateProfile(profile);
              if (!result.ok) {
                setErrors(result.fieldErrors ?? {});
                toast.error(result.error);
                return;
              }
              toast.success("Profile updated.");
              router.refresh();
            });
          }}
        >
          <Field label="Name" htmlFor="me-name" error={errors.name}>
            <input id="me-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="adm-input" required />
          </Field>
          <Field label="Email (used to log in)" htmlFor="me-email" error={errors.email}>
            <input id="me-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="adm-input" required />
          </Field>
          <SubmitButton pending={savingProfile}>Save profile</SubmitButton>
        </form>
      </Card>

      <Card title="Change password">
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (passwords.next !== passwords.confirm) {
              setErrors({ confirm: "The new passwords don't match." });
              return;
            }
            startPassword(async () => {
              const result = await changeOwnPassword({ current: passwords.current, next: passwords.next });
              if (!result.ok) {
                setErrors(result.fieldErrors ?? {});
                toast.error(result.error);
                return;
              }
              setErrors({});
              setPasswords({ current: "", next: "", confirm: "" });
              toast.success("Password changed. Other devices have been signed out.");
            });
          }}
        >
          <Field label="Current password" htmlFor="pw-current" error={errors.current}>
            <input id="pw-current" type="password" autoComplete="current-password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="adm-input" required />
          </Field>
          <Field label="New password" htmlFor="pw-next" error={errors.next} hint="At least 10 characters with letters and numbers.">
            <input id="pw-next" type="password" autoComplete="new-password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} className="adm-input" required />
          </Field>
          <Field label="Repeat new password" htmlFor="pw-confirm" error={errors.confirm}>
            <input id="pw-confirm" type="password" autoComplete="new-password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="adm-input" required />
          </Field>
          <SubmitButton pending={savingPassword}>
            <KeyRound className="size-4" aria-hidden="true" /> Change password
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}

function UserActions({ user, className }: { user: UserRow; className?: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      <ActionButton
        className="adm-btn-ghost adm-btn-sm"
        action={async () => {
          const password = window.prompt(`New password for ${user.name} (at least 10 characters, letters and numbers):`);
          if (!password) return { ok: true as const };
          return resetUserPassword(user.id, password);
        }}
        success="Password reset. Share it with the user securely."
      >
        <KeyRound className="size-3.5" aria-hidden="true" /> Reset password
      </ActionButton>
      <ActionButton
        className="adm-btn-ghost adm-btn-sm text-red-600"
        action={deleteUser.bind(null, user.id)}
        confirm={`Remove ${user.name}'s access?`}
        success="User removed."
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Delete</span>
      </ActionButton>
    </div>
  );
}

export function TeamManager({ users, meId }: { users: UserRow[]; meId: number }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" as "admin" | "editor" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="adm-card @container">
        <ul className="divide-y divide-[#f3e8ee] @xl:hidden">
          {users.map((u) => (
            <li key={u.id} className="px-4 py-3.5">
              <p className="font-semibold text-ink">
                {u.name} {u.id === meId && <span className="text-xs font-normal text-subtle">(you)</span>}
              </p>
              <p className="truncate text-xs text-subtle">{u.email}</p>
              <p className="mt-1 text-xs text-muted">
                <span className="capitalize">{u.role}</span> · Last login {u.lastLoginAt ? formatShortDate(u.lastLoginAt) : "never"}
              </p>
              {u.id !== meId && <UserActions user={u} className="mt-2 -ml-2.5" />}
            </li>
          ))}
        </ul>
        <div className="relative hidden overflow-x-auto @xl:block">
          <table className="adm-table min-w-[560px]">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Last login</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <p className="font-semibold text-ink">
                      {u.name} {u.id === meId && <span className="text-xs font-normal text-subtle">(you)</span>}
                    </p>
                    <p className="text-xs text-subtle">{u.email}</p>
                  </td>
                  <td className="capitalize text-muted">{u.role}</td>
                  <td className="text-xs text-muted">{u.lastLoginAt ? formatShortDate(u.lastLoginAt) : "Never"}</td>
                  <td>{u.id !== meId && <UserActions user={u} className="justify-end" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Card title="Add a team member" className="h-fit">
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const result = await createUser(form);
              if (!result.ok) {
                setErrors(result.fieldErrors ?? {});
                toast.error(result.error);
                return;
              }
              setErrors({});
              setForm({ name: "", email: "", password: "", role: "editor" });
              toast.success("User added. Share the login details securely.");
              router.refresh();
            });
          }}
        >
          <Field label="Name" htmlFor="new-name" error={errors.name}>
            <input id="new-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="adm-input" required />
          </Field>
          <Field label="Email" htmlFor="new-email" error={errors.email}>
            <input id="new-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="adm-input" required />
          </Field>
          <Field label="Password" htmlFor="new-password" error={errors.password} hint="At least 10 characters with letters and numbers.">
            <input id="new-password" type="text" autoComplete="off" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="adm-input font-mono" required />
          </Field>
          <Field label="Role" htmlFor="new-role" hint="Editors can manage content. Admins can also manage users and settings.">
            <select id="new-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "editor" })} className="adm-input">
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <SubmitButton pending={pending}>
            <UserPlus className="size-4" aria-hidden="true" /> Add user
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
