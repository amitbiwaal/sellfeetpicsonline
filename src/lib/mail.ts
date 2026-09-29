import "server-only";

/**
 * Optional email notifications through Resend (https://resend.com).
 * Set RESEND_API_KEY and MAIL_FROM (a sender on a domain verified in Resend).
 * Without them, messages are still saved and shown in Admin → Messages.
 */
export async function sendEmail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim();
  if (!apiKey || !from || !to) return { sent: false as const, reason: "not-configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text, reply_to: replyTo }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("Email notification failed:", res.status, await res.text().catch(() => ""));
      return { sent: false as const, reason: "provider-error" };
    }
    return { sent: true as const };
  } catch (error) {
    console.error("Email notification failed:", error);
    return { sent: false as const, reason: "network-error" };
  }
}
