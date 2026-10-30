import type { VehiclePhoto } from "./types";

/** Allowed resize widths for `/api/media/photo` (keeps cache keys small). */
export const PHOTO_WIDTHS = [320, 640, 1200, 1600] as const;
export type PhotoWidth = (typeof PHOTO_WIDTHS)[number];

export function clampPhotoWidth(raw: string | null | undefined): PhotoWidth | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  let best: PhotoWidth = PHOTO_WIDTHS[0];
  for (const width of PHOTO_WIDTHS) {
    best = width;
    if (n <= width) break;
  }
  return best;
}

/** Public URL for a listing photo. Demo placeholders use static files; uploads go through the media API. */
export function photoUrl(photo: VehiclePhoto, width?: PhotoWidth): string | null {
  if (photo.placeholder) return photo.path;
  const base = `/api/media/photo/${encodeURIComponent(photo.id)}`;
  return width ? `${base}?w=${width}` : base;
}
