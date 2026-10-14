import { NextResponse } from "next/server";

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
  const host = request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export function resultResponse(request: Request, result: { status: number; body: Record<string, unknown> }, fallbackPath: string) {
  if ((request.headers.get("accept") ?? "").includes("application/json")) {
    return NextResponse.json(result.body, { status: result.status });
  }
  const referer = request.headers.get("referer");
  let target: URL;
  try {
    const candidate = referer ? new URL(referer) : new URL(fallbackPath, request.url);
    const current = new URL(request.url);
    target = candidate.host === current.host ? candidate : new URL(fallbackPath, request.url);
  } catch {
    target = new URL(fallbackPath, request.url);
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
