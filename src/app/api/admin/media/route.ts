import crypto from "node:crypto";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { saveUpload } from "@/lib/storage";
import { slugify } from "@/lib/utils";

export const maxDuration = 60;

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function humanize(base: string) {
  const text = base.replace(/[-_]+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

/**
 * Upload images from the admin panel. Photos are auto-rotated, stripped of
 * EXIF/GPS metadata, resized to max 2400px and converted to WebP.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please log in again." }, { status: 401 });
  if (!sameOrigin(request)) return Response.json({ ok: false, error: "Invalid origin." }, { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Upload failed. The file may be too large." }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return Response.json({ ok: false, error: "No files received." }, { status: 400 });

  const items = [];
  const errors: string[] = [];

  for (const file of files.slice(0, 20)) {
    if (file.size > MAX_BYTES) {
      errors.push(`${file.name}: larger than 15 MB.`);
      continue;
    }
    if (!ALLOWED.has(file.type)) {
      errors.push(`${file.name}: only JPG, PNG, WebP, GIF or AVIF images are allowed.`);
      continue;
    }

    try {
      const input = Buffer.from(await file.arrayBuffer());
      let output: Buffer;
      let ext: string;
      let mimeType: string;
      let width: number | undefined;
      let height: number | undefined;

      if (file.type === "image/gif") {
        const meta = await sharp(input, { animated: true }).metadata();
        output = input;
        ext = "gif";
        mimeType = "image/gif";
        width = meta.width;
        height = meta.pageHeight ?? meta.height;
      } else {
        const { data, info } = await sharp(input, { failOn: "error" })
          .rotate()
          .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer({ resolveWithObject: true });
        output = data;
        ext = "webp";
        mimeType = "image/webp";
        width = info.width;
        height = info.height;
      }

      const base = slugify(file.name.replace(/\.[^.]+$/, ""), 60) || "image";
      const now = new Date();
      const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
      const key = `${folder}/${base}-${crypto.randomBytes(3).toString("hex")}.${ext}`;
      const { url, storageKey } = await saveUpload(key, output, mimeType);

      const row = await db
        .insert(media)
        .values({
          url,
          storageKey,
          filename: `${base}.${ext}`,
          mimeType,
          size: output.length,
          width: width ?? null,
          height: height ?? null,
          alt: humanize(base),
        })
        .returning()
        .get();
      items.push(row);
    } catch (error) {
      console.error("Upload failed:", error);
      errors.push(`${file.name}: could not process this image.`);
    }
  }

  return Response.json({ ok: items.length > 0, items, errors, error: items.length ? undefined : errors[0] });
}
