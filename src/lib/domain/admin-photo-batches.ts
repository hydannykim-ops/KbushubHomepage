import { PHOTO_TABS, type PhotoTab } from "@/lib/domain/photo-categories";

export type AdminPhotoBatch<T> = {
  category: PhotoTab;
  items: T[];
  sortBase: number;
};

/** Keep exterior → interior → other → registration, chunked for the batch upload route. */
export function adminPhotoBatches<T>(
  grouped: Record<PhotoTab, T[]>,
  chunkSize: number,
  sortBaseStart = 0,
): AdminPhotoBatch<T>[] {
  const size = Math.max(1, Math.floor(chunkSize));
  const batches: AdminPhotoBatch<T>[] = [];
  let sortBase = Math.max(0, Math.floor(sortBaseStart));
  for (const category of PHOTO_TABS) {
    const items = grouped[category] ?? [];
    for (let offset = 0; offset < items.length; offset += size) {
      const slice = items.slice(offset, offset + size);
      batches.push({ category, items: slice, sortBase });
      sortBase += slice.length;
    }
  }
  return batches;
}
