import { PHOTO_SLOTS, type PhotoSlotId } from "@/lib/domain/photo-slots";
import type { PhotoCategory } from "@/lib/domain/types";
import { checkImage, MAX_EXTRA_PHOTOS, MAX_VEHICLE_PHOTOS, type ImageType } from "@/lib/domain/uploads";

export type GuidedPhotoShot = {
  slot: PhotoSlotId | `extra-${number}`;
  bytes: Buffer;
  contentType: ImageType;
  category: PhotoCategory;
  cover: boolean;
  label: string;
};

const labelsKo: Record<PhotoSlotId, string> = {
  front: "정면",
  left: "좌측",
  right: "우측",
  rear: "후면",
  interior: "내부",
  dashboard: "계기판",
  wheel1: "바퀴1",
  wheel2: "바퀴2",
  wheel3: "바퀴3",
  wheel4: "바퀴4",
};

const labelsEn: Record<PhotoSlotId, string> = {
  front: "Front",
  left: "Left",
  right: "Right",
  rear: "Rear",
  interior: "Interior",
  dashboard: "Dashboard",
  wheel1: "Wheel 1",
  wheel2: "Wheel 2",
  wheel3: "Wheel 3",
  wheel4: "Wheel 4",
};

export async function readGuidedPhotos(
  form: FormData,
  lang: string,
  maxTotal: number = MAX_VEHICLE_PHOTOS,
): Promise<{ ok: true; shots: GuidedPhotoShot[] } | { ok: false; code: "missing_required" | "invalid_image" }> {
  const shots: GuidedPhotoShot[] = [];
  for (const slot of PHOTO_SLOTS) {
    const value = form.get(slot.field);
    if (!(value instanceof File) || value.size === 0) {
      if (slot.required) return { ok: false, code: "missing_required" };
      continue;
    }
    const bytes = Buffer.from(await value.arrayBuffer());
    const checked = checkImage(bytes);
    if (!checked.ok) return { ok: false, code: "invalid_image" };
    shots.push({
      slot: slot.id,
      bytes,
      contentType: checked.contentType,
      category: slot.category,
      cover: Boolean(slot.cover),
      label: lang === "ko" ? labelsKo[slot.id] : labelsEn[slot.id],
    });
  }

  const extras = form
    .getAll("extra")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, MAX_EXTRA_PHOTOS);

  for (const [index, file] of extras.entries()) {
    if (shots.length >= maxTotal) break;
    const bytes = Buffer.from(await file.arrayBuffer());
    const checked = checkImage(bytes);
    if (!checked.ok) return { ok: false, code: "invalid_image" };
    shots.push({
      slot: `extra-${index + 1}`,
      bytes,
      contentType: checked.contentType,
      category: "exterior",
      cover: false,
      label: lang === "ko" ? `추가 ${index + 1}` : `Extra ${index + 1}`,
    });
  }

  return { ok: true, shots };
}
