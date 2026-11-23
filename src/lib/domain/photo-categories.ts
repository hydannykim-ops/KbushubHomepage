import type { PhotoCategory } from "@/lib/domain/types";

/** Public upload + gallery filter tabs (excluding "all"). */
export type PhotoTab = "exterior" | "interior" | "other" | "registration";

export const PHOTO_TABS: PhotoTab[] = ["exterior", "interior", "other", "registration"];

export const PHOTO_TAB_FIELD: Record<PhotoTab, string> = {
  exterior: "photos_exterior",
  interior: "photos_interior",
  other: "photos_other",
  registration: "photos_registration",
};

/** Map any stored category onto one of the four gallery tabs. */
export function photoTabForCategory(category: PhotoCategory): PhotoTab {
  switch (category) {
    case "interior":
    case "dashboard":
      return "interior";
    case "registration":
      return "registration";
    case "other":
    case "defect":
      return "other";
    default:
      return "exterior";
  }
}

export function photoMatchesTab(category: PhotoCategory, tab: PhotoTab | "all"): boolean {
  if (tab === "all") return true;
  return photoTabForCategory(category) === tab;
}
