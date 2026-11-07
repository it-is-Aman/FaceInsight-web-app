"use client";

import imageCompression from "browser-image-compression";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_INPUT_BYTES = 20 * 1024 * 1024;

/** Shrink to <1.5 MB JPEG on-device: faster upload, fits Vercel's body limit, strips EXIF metadata. */
export function compressForUpload(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.9,
  });
}

export interface QualityReport {
  width: number;
  height: number;
  warnings: string[];
}

/** Cheap client-side checks that catch the most common bad photos before we spend a credit. */
export async function checkQuality(file: Blob): Promise<QualityReport> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const warnings: string[] = [];

  if (Math.min(width, height) < 400) warnings.push("Low resolution. Results may be less reliable.");

  const sample = 64;
  const canvas = new OffscreenCanvas(sample, sample);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(bitmap, 0, 0, sample, sample);
    const { data } = ctx.getImageData(0, 0, sample, sample);
    let lum = 0;
    for (let i = 0; i < data.length; i += 4) lum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    lum /= data.length / 4;
    if (lum < 55) warnings.push("The photo looks dark. Try facing a window.");
    else if (lum > 215) warnings.push("The photo looks over-exposed. Avoid direct flash or harsh sun.");
  }
  bitmap.close();
  return { width, height, warnings };
}

/** Small thumbnail kept in sessionStorage so the report can show your photo on this device only. */
export async function makeThumbnail(file: Blob, size = 480): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.8);
}

const THUMB_KEY = (id: string) => `faceinsight:photo:${id}`;

export function saveThumbnail(id: string, dataUrl: string) {
  try {
    sessionStorage.setItem(THUMB_KEY(id), dataUrl);
  } catch {
    /* storage full or disabled: the report simply won't show the photo */
  }
}

export function loadThumbnail(id: string): string | null {
  try {
    return sessionStorage.getItem(THUMB_KEY(id));
  } catch {
    return null;
  }
}
