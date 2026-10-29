import { SESSION_COOKIE, demoSessionToken } from "@/lib/auth/session";
import { getDataSource } from "@/lib/config";
import { StoreError } from "@/lib/demo/store";
import { getRepository } from "@/lib/data/repository";
import { createSupabaseServer } from "@/lib/supabase/clients";
import { crossOrigin, readBody, resultResponse } from "@/lib/http/form";
import { allowRequest, clientKey } from "@/lib/http/rate-limit";
import { parseSignup } from "@/lib/domain/validation";
import { openGate } from "@/lib/server/gate";
import { langFromBody } from "@/lib/request-context";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const fallback = "/ko/account/signup";
  if (crossOrigin(request)) return resultResponse(request, { status: 403, body: { ok: false, code: "origin" } }, fallback);
  if (!allowRequest(`signup:${clientKey(request)}`, 8)) {
    return resultResponse(request, { status: 429, body: { ok: false, code: "rate_limited" } }, fallback);
  }
  const body = await readBody(request);
  const lang = langFromBody(body.lang);
  const parsed = parseSignup(body, lang);
  if (!parsed.ok) return resultResponse(request, { status: 400, body: { ok: false, code: "invalid", errors: parsed.errors } }, `/${lang}/account/signup`);
  const gate = await openGate();
  if (!gate.ok) return resultResponse(request, { status: gate.code === "privacy_disabled" ? 403 : 503, body: { ok: false, code: gate.code } }, `/${lang}/account/signup`);
  try {
    const member = await getRepository().signupMember(parsed.data);
    if (getDataSource() === "demo") {
      const response = resultResponse(request, { status: 201, body: { ok: true, demo: true, id: member.id } }, `/${lang}/account`);
      response.cookies.set(SESSION_COOKIE, demoSessionToken({
        sub: member.id,
        role: member.role,
        email: member.email,
        name: member.name,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
    // Only create a session for a brand-new account. Never sign in on duplicate / failed signup.
    const supabase = await createSupabaseServer();
    const signed = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    if (signed.error || !signed.data.user || signed.data.user.id !== member.id) {
      await supabase.auth.signOut();
      return resultResponse(
        request,
        { status: 201, body: { ok: true, demo: false, id: member.id, loginRequired: true } },
        `/${lang}/account/login`,
      );
    }
    return resultResponse(request, { status: 201, body: { ok: true, demo: false, id: member.id } }, `/${lang}/account`);
  } catch (error) {
    if (error instanceof StoreError && error.code === "duplicate_email") {
      // Clear any accidental session so a failed signup never looks like a login.
      if (getDataSource() === "supabase") {
        const supabase = await createSupabaseServer();
        await supabase.auth.signOut();
      }
      return resultResponse(
        request,
        { status: 409, body: { ok: false, code: "duplicate_email" } },
        `/${lang}/account/login`,
      );
    }
    return resultResponse(request, { status: 500, body: { ok: false, code: "save_failed" } }, `/${lang}/account/signup`);
  }
}
