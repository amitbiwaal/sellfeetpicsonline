"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { getSettings } from "@/lib/data/settings";
import { sendEmail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
  values?: { name: string; email: string; phone: string; message: string };
};

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(160),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .regex(/^[+()\-.\s\d]*$/, "Please enter a valid phone number."),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least a short message (10+ characters).")
    .max(1000, "Please keep your message under 1000 characters."),
});

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Spam traps: a hidden field bots fill in, and forms submitted impossibly fast.
  const honeypot = String(formData.get("website") ?? "");
  const startedAt = Number(formData.get("started_at") ?? 0);
  if (honeypot || (startedAt && Date.now() - startedAt < 2500)) {
    return { status: "success", message: "Thanks! Your message has been sent." };
  }

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ContactState["errors"]>;
      errors[key] ??= issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", errors, values };
  }

  const ip = clientIp(await headers());
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000).ok) {
    return {
      status: "error",
      message: "You've sent several messages recently. Please try again in an hour.",
      values,
    };
  }

  const data = parsed.data;
  await db.insert(messages).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
  });

  const settings = await getSettings();
  const notifyTo = settings.notify_email || settings.contact_email;
  await sendEmail({
    to: notifyTo,
    replyTo: data.email,
    subject: `New message from ${data.name} — ${settings.site_name}`,
    text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "-"}\n\n${data.message}\n\n— Sent from the contact form. See all messages in Admin → Messages.`,
  });

  return { status: "success", message: "Thanks! Your message has been sent. We'll get back to you soon." };
}
