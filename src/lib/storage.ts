import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Where uploaded images live:
 * - Local disk (default): storage/uploads, served at /media/… (works on any VPS / Node host)
 * - Vercel Blob: used automatically when BLOB_READ_WRITE_TOKEN is set (needed on Vercel)
 */
// Runtime data folder: excluded from build-time file tracing.
export const UPLOAD_ROOT = path.resolve(
  /*turbopackIgnore: true*/ process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "storage", "uploads"),
);

function usesBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function resolveLocalPath(key: string) {
  const target = path.resolve(UPLOAD_ROOT, ...key.split("/"));
  return target.startsWith(UPLOAD_ROOT + path.sep) ? target : null;
}

export async function saveUpload(key: string, data: Buffer, contentType: string) {
  if (usesBlobStorage()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${key}`, data, { access: "public", contentType, addRandomSuffix: false });
    return { url: blob.url, storageKey: `blob:${blob.url}` };
  }

  const target = resolveLocalPath(key);
  if (!target) throw new Error("Invalid upload path");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, data);
  return { url: `/media/${key}`, storageKey: `local:${key}` };
}

/** Remove an uploaded file. Imported WordPress images (no storage key) are left in /public. */
export async function deleteUpload(storageKey: string) {
  if (storageKey.startsWith("blob:")) {
    const { del } = await import("@vercel/blob");
    await del(storageKey.slice("blob:".length)).catch((error) => console.error("Blob delete failed:", error));
    return;
  }
  if (storageKey.startsWith("local:")) {
    const target = resolveLocalPath(storageKey.slice("local:".length));
    if (target) await fs.rm(target, { force: true });
  }
}

const MIME_BY_EXT: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  avif: "image/avif",
};

export function mimeTypeFor(filename: string) {
  return MIME_BY_EXT[filename.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
}
