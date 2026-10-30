export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VEHICLE_PHOTOS = 20;
export const MAX_SELL_PHOTOS = 20;
export const MAX_EXTRA_PHOTOS = 8;

export type ImageType = "image/jpeg" | "image/png" | "image/webp";

export function sniffImage(bytes: Uint8Array): ImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((value, index) => bytes[index] === value)) return "image/png";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function extensionFor(type: ImageType): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function checkImage(bytes: Uint8Array): { ok: true; contentType: ImageType } | { ok: false; code: "type" | "size" } {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) return { ok: false, code: "size" };
  const contentType = sniffImage(bytes);
  if (!contentType) return { ok: false, code: "type" };
  return { ok: true, contentType };
}
