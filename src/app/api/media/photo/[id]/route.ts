import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const admin = await requireAdmin();
  const photo = await getRepository().readPhoto(id, Boolean(admin));
  if (!photo) return new NextResponse("Not found", { status: 404 });
  let bytes = photo.bytes;
  let contentType = photo.contentType;
  try {
    const pipeline = sharp(bytes).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true });
    if ((request.headers.get("accept") ?? "").includes("image/webp")) {
      bytes = await pipeline.webp({ quality: 75 }).toBuffer();
      contentType = "image/webp";
    } else if (contentType === "image/png") {
      bytes = await pipeline.png().toBuffer();
    } else {
      bytes = await pipeline.jpeg({ quality: 78 }).toBuffer();
      contentType = "image/jpeg";
    }
  } catch {
    bytes = photo.bytes;
    contentType = photo.contentType;
  }
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": admin ? "private, no-store" : "public, max-age=86400",
    },
  });
}
