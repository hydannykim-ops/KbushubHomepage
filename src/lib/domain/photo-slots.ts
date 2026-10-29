import type { PhotoCategory } from "@/lib/domain/types";

export type PhotoSlotId =
  | "front"
  | "left"
  | "right"
  | "rear"
  | "interior"
  | "dashboard"
  | "wheel1"
  | "wheel2"
  | "wheel3"
  | "wheel4";

export type PhotoSlotDef = {
  id: PhotoSlotId;
  field: string;
  required: boolean;
  category: PhotoCategory;
  cover?: boolean;
};

/** Customer / dealer upload checklist: angles that make appraisal easy. */
export const PHOTO_SLOTS: PhotoSlotDef[] = [
  { id: "front", field: "front", required: true, category: "front", cover: true },
  { id: "left", field: "left", required: true, category: "front_side" },
  { id: "right", field: "right", required: true, category: "exterior" },
  { id: "rear", field: "rear", required: true, category: "rear" },
  { id: "interior", field: "interior", required: false, category: "interior" },
  { id: "dashboard", field: "dashboard", required: false, category: "dashboard" },
  { id: "wheel1", field: "wheel1", required: false, category: "tires" },
  { id: "wheel2", field: "wheel2", required: false, category: "tires" },
  { id: "wheel3", field: "wheel3", required: false, category: "tires" },
  { id: "wheel4", field: "wheel4", required: false, category: "tires" },
];

export const REQUIRED_PHOTO_SLOTS = PHOTO_SLOTS.filter((slot) => slot.required);
export const MAX_GUIDED_PHOTOS = PHOTO_SLOTS.length;
