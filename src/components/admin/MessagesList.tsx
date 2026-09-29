"use client";

import { Mail, MailOpen, Phone, Reply, Trash2 } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/app/admin/_actions/messages";
import type { Message } from "@/lib/db/schema";
import { cn, formatDate } from "@/lib/utils";
import { ActionButton } from "./ConfirmButton";

export function MessagesList({ messages, siteName }: { messages: Message[]; siteName: string }) {
  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <li key={m.id} className={cn("adm-card p-5", !m.isRead && "border-l-4 border-l-brand-bright")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold text-ink">
                {!m.isRead && <span className="rounded-full bg-brand-bright px-2 py-0.5 text-[10px] font-bold text-white uppercase">New</span>}
                {m.name}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-brand">
                  <Mail className="size-3.5" aria-hidden="true" /> {m.email}
                </a>
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:text-brand">
                    <Phone className="size-3.5" aria-hidden="true" /> {m.phone}
                  </a>
                )}
              </p>
            </div>
            <time className="text-xs text-subtle" dateTime={m.createdAt.toISOString()}>
              {formatDate(m.createdAt)}
            </time>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap text-body">{m.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: your message to ${siteName}`)}`}
              className="adm-btn adm-btn-secondary adm-btn-sm"
            >
              <Reply className="size-3.5" aria-hidden="true" /> Reply by email
            </a>
            <ActionButton action={setMessageRead.bind(null, m.id, !m.isRead)} className="adm-btn-ghost adm-btn-sm">
              {m.isRead ? <Mail className="size-3.5" aria-hidden="true" /> : <MailOpen className="size-3.5" aria-hidden="true" />}
              {m.isRead ? "Mark unread" : "Mark read"}
            </ActionButton>
            <ActionButton
              action={deleteMessage.bind(null, m.id)}
              confirm="Delete this message?"
              success="Message deleted."
              className="adm-btn-ghost adm-btn-sm text-red-600"
            >
              <Trash2 className="size-3.5" aria-hidden="true" /> Delete
            </ActionButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
