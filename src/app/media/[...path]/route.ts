import fs from "node:fs/promises";
import { mimeTypeFor, resolveLocalPath } from "@/lib/storage";

/** Serves images uploaded through the admin panel (local disk storage). */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const key = parts.map((p) => decodeURIComponent(p)).join("/");
  if (!/^[a-z0-9/_.-]+$/i.test(key) || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const file = resolveLocalPath(key);
  if (!file) return new Response("Not found", { status: 404 });

  try {
    const data = await fs.readFile(file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": mimeTypeFor(file),
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
