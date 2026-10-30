/** Browser-only: shrink listing photos so multipart stays under the Vercel ~4.5MB body limit. */

const MAX_EDGE = 1600;
const TARGET_BYTES = 320_000;

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size === 0) return file;
  if (file.size <= TARGET_BYTES && file.type === "image/jpeg") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.82;
  let blob = await canvasToBlob(canvas, quality);
  while (blob && blob.size > TARGET_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }
  if (!blob) return file;
  if (blob.size >= file.size && file.type === "image/jpeg") return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

export async function compressFormImages(form: FormData): Promise<FormData> {
  const next = new FormData();
  for (const [key, value] of form.entries()) {
    if (value instanceof File && value.size > 0 && value.type.startsWith("image/")) {
      next.append(key, await compressImageFile(value));
    } else {
      next.append(key, value);
    }
  }
  return next;
}
