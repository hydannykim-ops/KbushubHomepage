/** Browser-only: shrink listing photos so multipart stays under the Vercel ~4.5MB body limit. */

const MAX_EDGE = 1280;
const TARGET_BYTES = 280_000;
const SKIP_BELOW = 400_000;
const QUALITY = 0.72;
const CONCURRENCY = 2;

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size === 0) return file;
  if (file.size <= SKIP_BELOW && file.type === "image/jpeg") return file;

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
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = QUALITY;
  let blob = await canvasToBlob(canvas, quality);
  if (blob && blob.size > TARGET_BYTES) {
    quality = 0.55;
    blob = await canvasToBlob(canvas, quality);
  }
  if (!blob) return file;
  if (blob.size >= file.size && file.type === "image/jpeg") return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      out[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return out;
}

export async function compressFormImages(form: FormData): Promise<FormData> {
  const entries = Array.from(form.entries());
  const compressed = await mapPool(entries, CONCURRENCY, async ([key, value]) => {
    if (value instanceof File && value.size > 0 && value.type.startsWith("image/")) {
      return [key, await compressImageFile(value)] as const;
    }
    return [key, value] as const;
  });
  const next = new FormData();
  for (const [key, value] of compressed) next.append(key, value);
  return next;
}
