import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type AllowedImageType = keyof typeof ALLOWED_IMAGE_TYPES;

const MAGIC: { type: AllowedImageType; test: (bytes: Uint8Array) => boolean }[] =
  [
    {
      type: "image/jpeg",
      test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    },
    {
      type: "image/png",
      test: (b) =>
        b[0] === 0x89 &&
        b[1] === 0x50 &&
        b[2] === 0x4e &&
        b[3] === 0x47 &&
        b[4] === 0x0d &&
        b[5] === 0x0a &&
        b[6] === 0x1a &&
        b[7] === 0x0a,
    },
    {
      type: "image/webp",
      test: (b) =>
        b[0] === 0x52 &&
        b[1] === 0x49 &&
        b[2] === 0x46 &&
        b[3] === 0x46 &&
        b[8] === 0x57 &&
        b[9] === 0x45 &&
        b[10] === 0x42 &&
        b[11] === 0x50,
    },
  ];

export function uploadRoot() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

export type SaveImageResult =
  | { ok: true; url: string; size: number; type: AllowedImageType }
  | { ok: false; error: string };

export async function saveImage(
  file: File,
  maxMb: number,
): Promise<SaveImageResult> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Pilih berkas gambar terlebih dahulu." };
  }

  const maxBytes = Math.max(1, maxMb) * 1024 * 1024;
  if (file.size > maxBytes) {
    return { ok: false, error: `Ukuran berkas maksimal ${maxMb} MB.` };
  }

  if (!(file.type in ALLOWED_IMAGE_TYPES)) {
    return {
      ok: false,
      error: "Format harus JPG, PNG, atau WEBP.",
    };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const signature = MAGIC.find((entry) => entry.test(buffer));
  if (!signature || signature.type !== file.type) {
    return { ok: false, error: "Isi berkas tidak sesuai format gambar." };
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const dir = path.join(uploadRoot(), year, month);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ALLOWED_IMAGE_TYPES[signature.type]}`;
  const fullPath = path.join(dir, filename);
  await writeFile(fullPath, buffer);

  return {
    ok: true,
    url: `/media/${year}/${month}/${filename}`,
    size: buffer.byteLength,
    type: signature.type,
  };
}

export function resolveMediaPath(segments: string[]): string | null {
  if (segments.length === 0) return null;
  const root = uploadRoot();
  const target = path.join(root, ...segments);
  const normalized = path.normalize(target);
  if (!normalized.startsWith(root + path.sep)) return null;
  return normalized;
}

export async function removeUploadedFile(
  url: string | null | undefined,
): Promise<void> {
  if (!url) return;
  const marker = "/media/";
  const position = url.indexOf(marker);
  if (position === -1) return;
  const segments = url
    .slice(position + marker.length)
    .split("?")[0]
    .split("/")
    .filter(Boolean);
  if (segments.length === 0) return;
  const target = resolveMediaPath(segments);
  if (!target) return;
  try {
    await rm(target, { force: true });
  } catch {
    // ignore missing or unreadable files
  }
}

export async function removeUploadedFiles(
  urls: (string | null | undefined)[],
): Promise<void> {
  const unique = [...new Set(urls.filter((url): url is string => Boolean(url)))];
  await Promise.all(unique.map((url) => removeUploadedFile(url)));
}
