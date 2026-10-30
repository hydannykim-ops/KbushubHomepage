import { getSession, requireAdmin } from "@/lib/auth/session";
import { StoreError } from "@/lib/demo/store";
import { getRepository } from "@/lib/data/repository";
import { crossOrigin, readBody, resultResponse } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import { langFromBody } from "@/lib/request-context";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const fallback = `/ko/account/inquiries/${encodeURIComponent(id)}`;
  if (crossOrigin(request)) return resultResponse(request, { status: 403, body: { ok: false, code: "origin" } }, fallback);
  if (!allowRequest(`inquiry-msg:${clientKey(request)}`)) {
    return resultResponse(request, { status: 429, body: { ok: false, code: "rate_limited" } }, fallback);
  }
  const body = await readBody(request);
  const lang = langFromBody(body.lang);
  const redirect = `/${lang}/account/inquiries/${encodeURIComponent(id)}`;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length < 1 || message.length > 4000) {
    return resultResponse(request, { status: 400, body: { ok: false, code: "invalid_message" } }, redirect);
  }

  const admin = await requireAdmin();
  const session = admin ?? (await getSession());
  if (!session) {
    return resultResponse(request, { status: 401, body: { ok: false, code: "auth_required" } }, `/${lang}/account/login`);
  }

  const viewer =
    session.role === "admin"
      ? { memberId: null as string | null, email: session.email, admin: true }
      : session.role === "customer" || session.role === "dealer"
        ? { memberId: session.sub, email: session.email, admin: false }
        : null;
  if (!viewer) {
    return resultResponse(request, { status: 403, body: { ok: false, code: "forbidden" } }, redirect);
  }

  const repo = getRepository();
  const thread = await repo.openInquiryThread(id, viewer);
  if (!thread) {
    return resultResponse(request, { status: 404, body: { ok: false, code: "not_found" } }, `/${lang}/account`);
  }

  try {
    await repo.addInquiryMessage(id, {
      authorRole: thread.viewerRole,
      authorId: session.role === "admin" ? session.sub : session.sub,
      body: message,
    });
  } catch (error) {
    const code = error instanceof StoreError ? error.code : "save_failed";
    return resultResponse(request, { status: 400, body: { ok: false, code } }, redirect);
  }

  return resultResponse(request, { status: 200, body: { ok: true, demo: thread.inquiry.demo } }, redirect);
}
