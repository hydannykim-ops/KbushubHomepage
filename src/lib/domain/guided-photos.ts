import { PHOTO_SLOTS, type PhotoSlotId } from "@/lib/domain/photo-slots";
import type { PhotoCategory } from "@/lib/domain/types";
import { checkImage, type ImageType } from "@/lib/domain/uploads";

export type GuidedPhotoShot = {
  slot: PhotoSlotId;
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
  return { ok: true, shots };
}
