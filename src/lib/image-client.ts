"use client";

/**
 * Utilitas gambar sisi browser.
 *
 * Semua foto dinormalisasi menjadi JPEG, diperkecil, dan dikompres sebelum
 * dikirim ke server action. Ini mencegah error 413/body terlalu besar dan
 * membuat upload dari kamera ponsel tetap cepat.
 */

export const MAX_IMAGE_DIMENSION = 1800;
export const MAX_UPLOAD_BYTES = 9 * 1024 * 1024;

export type ImageCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const SOURCE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/gif",
  "image/bmp",
  "image/tiff",
]);

const SOURCE_EXTENSION =
  /\.(jpe?g|png|webp|heic|heif|avif|gif|bmp|tiff?)$/i;

export function isImageSource(file: File): boolean {
  return SOURCE_TYPES.has(file.type.toLowerCase()) ||
    SOURCE_EXTENSION.test(file.name);
}

export function sourceSizeLimitMb(maxMb: number): number {
  return Math.min(30, Math.max(15, Math.ceil(maxMb * 2.5)));
}

export function maxUploadBytes(maxMb: number): number {
  return Math.min(maxMb * 0.85, 9) * 1024 * 1024;
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(
        new Error(
          "Foto tidak bisa dibaca browser. Coba JPG, PNG, atau WEBP.",
        ),
      ),
    );
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

export function getRotatedSize(
  width: number,
  height: number,
  rotation: number,
) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width:
      Math.abs(width * Math.cos(rotRad)) +
      Math.abs(height * Math.sin(rotRad)),
    height:
      Math.abs(width * Math.sin(rotRad)) +
      Math.abs(height * Math.cos(rotRad)),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Gagal membuat gambar. Coba foto lain."));
      },
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Menggambar area crop (dalam koordinat gambar setelah rotasi) ke canvas
 * berukuran terbatas, lalu menurunkan kualitas/resolusi sampai di bawah
 * batas byte. Tidak pernah membuat canvas seukuran foto asli.
 */
export async function renderImageToJpegBlob(
  image: HTMLImageElement,
  crop: ImageCrop,
  rotation: number,
  options: { maxDimension?: number; maxBytes?: number } = {},
): Promise<Blob> {
  const bBox = getRotatedSize(image.width, image.height, rotation);
  const maxDimension = options.maxDimension ?? MAX_IMAGE_DIMENSION;
  const maxBytes = Math.min(
    options.maxBytes ?? MAX_UPLOAD_BYTES,
    MAX_UPLOAD_BYTES,
  );

  const x = clamp(crop.x, 0, Math.max(0, bBox.width - 1));
  const y = clamp(crop.y, 0, Math.max(0, bBox.height - 1));
  const width = Math.max(1, Math.min(crop.width, bBox.width - x));
  const height = Math.max(1, Math.min(crop.height, bBox.height - y));

  let scale = Math.min(1, maxDimension / Math.max(width, height));
  let quality = 0.9;
  let lastBlob: Blob | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak tersedia di browser ini.");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      -x * scale,
      -y * scale,
    );
    ctx.translate(bBox.width / 2, bBox.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    const blob = await canvasToJpeg(canvas, quality);
    lastBlob = blob;
    if (blob.size <= maxBytes) return blob;

    if (quality > 0.62) {
      quality = Math.max(0.6, quality - 0.08);
    } else {
      scale *= 0.75;
    }
  }

  const size = lastBlob ? ` (${(lastBlob.size / 1024 / 1024).toFixed(1)} MB)` : "";
  throw new Error(
    `Foto masih terlalu besar${size}. Coba pilih foto lain atau potong lebih kecil.`,
  );
}

export function jpegFileFromBlob(blob: Blob, fileName: string): File {
  const base = fileName.replace(/\.[^.]+$/, "").trim() || "foto";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

/** Kompres foto tanpa crop, dipakai untuk upload galeri massal. */
export async function compressImageFile(
  file: File,
  maxMb: number,
): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await createImage(objectUrl);
    const full = getRotatedSize(image.width, image.height, 0);
    const blob = await renderImageToJpegBlob(
      image,
      { x: 0, y: 0, width: full.width, height: full.height },
      0,
      { maxBytes: maxUploadBytes(maxMb) },
    );
    return jpegFileFromBlob(blob, file.name);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
