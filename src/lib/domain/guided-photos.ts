import { PHOTO_TAB_FIELD, PHOTO_TABS, type PhotoTab } from "@/lib/domain/photo-categories";
import type { PhotoCategory } from "@/lib/domain/types";
import { checkImage, MAX_VEHICLE_PHOTOS, type ImageType } from "@/lib/domain/uploads";

export type GuidedPhotoShot = {
  slot: string;
  bytes: Buffer;
  contentType: ImageType;
  category: PhotoCategory;
  cover: boolean;
  label: string;
};

const tabLabelKo: Record<PhotoTab, string> = {
  exterior: "외부",
  interior: "내부",
  other: "기타",
  registration: "등록증",
};

const tabLabelEn: Record<PhotoTab, string> = {
  exterior: "Exterior",
  interior: "Interior",
  other: "Other",
  registration: "Registration",
};

/**
 * Read photos grouped by upload tabs.
 * Field names: photos_exterior / photos_interior / photos_other / photos_registration.
 * Legacy `extra` files (unguided bulk) are treated as "other".
 */
export async function readGuidedPhotos(
  form: FormData,
  lang: string,
  maxTotal: number = MAX_VEHICLE_PHOTOS,
  options?: { requireRequiredSlots?: boolean },
): Promise<{ ok: true; shots: GuidedPhotoShot[] } | { ok: false; code: "missing_required" | "invalid_image" }> {
  const requireAtLeastOne = options?.requireRequiredSlots === true;
  const shots: GuidedPhotoShot[] = [];
  const labelOf = (tab: PhotoTab, index: number) => {
    const base = lang === "ko" ? tabLabelKo[tab] : tabLabelEn[tab];
    return `${base} ${index + 1}`;
  };

  for (const tab of PHOTO_TABS) {
    const files = form
      .getAll(PHOTO_TAB_FIELD[tab])
      .filter((value): value is File => value instanceof File && value.size > 0);
    for (const [index, file] of files.entries()) {
      if (shots.length >= maxTotal) break;
      const bytes = Buffer.from(await file.arrayBuffer());
      const checked = checkImage(bytes);
      if (!checked.ok) return { ok: false, code: "invalid_image" };
      shots.push({
        slot: `${tab}-${index + 1}`,
        bytes,
        contentType: checked.contentType,
        category: tab,
        cover: shots.length === 0,
        label: labelOf(tab, index),
      });
    }
  }

  // Legacy bulk field from older clients → other.
  const extras = form
    .getAll("extra")
    .filter((value): value is File => value instanceof File && value.size > 0);
  for (const [index, file] of extras.entries()) {
    if (shots.length >= maxTotal) break;
    const bytes = Buffer.from(await file.arrayBuffer());
    const checked = checkImage(bytes);
    if (!checked.ok) return { ok: false, code: "invalid_image" };
    shots.push({
      slot: `other-legacy-${index + 1}`,
      bytes,
      contentType: checked.contentType,
      category: "other",
      cover: shots.length === 0,
      label: labelOf("other", index),
    });
  }

  if (requireAtLeastOne && shots.length === 0) return { ok: false, code: "missing_required" };
  return { ok: true, shots };
}
