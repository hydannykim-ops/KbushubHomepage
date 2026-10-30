import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { clampPhotoWidth, type PhotoWidth } from "@/lib/domain/photo-url";

export const runtime = "nodejs";

type CachedPhoto = { bytes: Buffer; contentType: string; etag: string };
const processedCache = new Map<string, CachedPhoto>();
const CACHE_LIMIT = 80;

function cacheGet(key: string): CachedPhoto | undefined {
  const hit = processedCache.get(key);
  if (!hit) return undefined;
  // Refresh insertion order for a simple LRU.
  processedCache.delete(key);
  processedCache.set(key, hit);
  return hit;
}

function cacheSet(key: string, value: CachedPhoto) {
  processedCache.set(key, value);
  while (processedCache.size > CACHE_LIMIT) {
    const oldest = processedCache.keys().next().value;
    if (oldest == null) break;
    processedCache.delete(oldest);
  }
}

function etagFor(bytes: Buffer, contentType: string): string {
  return `"${createHash("sha1").update(contentType).update(bytes).digest("base64url")}"`;
}

async function loadPhoto(id: string) {
  // Public listings: skip auth round-trip first (biggest latency on Supabase).
  const publicPhoto = await getRepository().readPhoto(id, { admin: false, ownerId: null });
  if (publicPhoto) return { photo: publicPhoto, privateViewer: false };

  const session = await getSession();
  const admin = session?.role === "admin";
  const ownerId = session && (session.role === "dealer" || session.role === "customer") ? session.sub : null;
  if (!admin && !ownerId) return { photo: null, privateViewer: false };

  const photo = await getRepository().readPhoto(id, { admin, ownerId });
  return { photo, privateViewer: true };
}

async function encodePhoto(bytes: Buffer, contentType: string, width: PhotoWidth | null, accept: string) {
  const pipeline = sharp(bytes).rotate();
  if (width) pipeline.resize({ width, height: width, fit: "inside", withoutEnlargement: true });
  else pipeline.resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true });

  if (accept.includes("image/webp")) {
    return { bytes: await pipeline.webp({ quality: 72 }).toBuffer(), contentType: "image/webp" };
  }
  if (contentType === "image/png") {
    return { bytes: await pipeline.png().toBuffer(), contentType: "image/png" };
  }
  return { bytes: await pipeline.jpeg({ quality: 76 }).toBuffer(), contentType: "image/jpeg" };
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const width = clampPhotoWidth(url.searchParams.get("w"));
  const accept = request.headers.get("accept") ?? "";
  const preferWebp = accept.includes("image/webp");
  const cacheKey = `${id}|w=${width ?? "full"}|${preferWebp ? "webp" : "orig"}`;

  const cached = cacheGet(cacheKey);
  if (cached) {
    const inm = request.headers.get("if-none-match");
    if (inm && inm === cached.etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: cached.etag } });
    }
    return new NextResponse(new Uint8Array(cached.bytes), {
      headers: {
        "Content-Type": cached.contentType,
        ETag: cached.etag,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  const { photo, privateViewer } = await loadPhoto(id);
  if (!photo) return new NextResponse("Not found", { status: 404 });

  let bytes = photo.bytes;
  let contentType = photo.contentType;
  try {
    const encoded = await encodePhoto(photo.bytes, photo.contentType, width, accept);
    bytes = encoded.bytes;
    contentType = encoded.contentType;
  } catch {
    bytes = photo.bytes;
    contentType = photo.contentType;
  }

  const etag = etagFor(bytes, contentType);
  if (!privateViewer) cacheSet(cacheKey, { bytes, contentType, etag });

  const inm = request.headers.get("if-none-match");
  if (inm && inm === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": privateViewer ? "private, no-store" : "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      ETag: etag,
      "Cache-Control": privateViewer ? "private, no-store" : "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
