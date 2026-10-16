import { NextResponse } from "next/server";
import { absoluteUrl, requestOrigin } from "@/lib/http/request-url";

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const json = (await request.json()) as unknown;
    return json && typeof json === "object" && !Array.isArray(json) ? (json as Record<string, unknown>) : {};
  }
  const form = await request.formData();
  const body: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") body[key] = value;
  }
  return body;
}

export function crossOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin !== requestOrigin(request);
  } catch {
    return true;
  }
}

export function resultResponse(request: Request, result: { status: number; body: Record<string, unknown> }, fallbackPath: string) {
  if ((request.headers.get("accept") ?? "").includes("application/json")) {
    return NextResponse.json(result.body, { status: result.status });
  }
  const origin = requestOrigin(request);
  const referer = request.headers.get("referer");
  let target: URL;
  try {
    const candidate = referer ? new URL(referer) : absoluteUrl(request, fallbackPath);
    target = candidate.origin === origin ? candidate : absoluteUrl(request, fallbackPath);
  } catch {
    target = absoluteUrl(request, fallbackPath);
  }
  if (result.body.ok === true) {
    target.searchParams.set("submitted", result.body.demo ? "demo" : "live");
    target.searchParams.delete("error");
  } else {
    target.searchParams.set("error", String(result.body.code ?? "save_failed"));
    target.searchParams.delete("submitted");
  }
  return NextResponse.redirect(target, 303);
}
