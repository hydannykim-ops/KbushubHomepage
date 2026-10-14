import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeReferralCode } from "@/lib/domain/referral";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/ko";
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  const lang = pathname.match(/^\/(ko|en)(\/|$)/)?.[1] ?? "ko";
  requestHeaders.set("x-kb-lang", lang);
  const headerMode = searchParams.get("mode");
  const headerRef = normalizeReferralCode(searchParams.get("ref"));
  if (headerMode === "domestic" || headerMode === "export") requestHeaders.set("x-kb-mode", headerMode);
  if (headerRef) requestHeaders.set("x-kb-ref", headerRef);
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const explicit = process.env.DATA_SOURCE?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnon && explicit !== "demo") {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnon, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
            response = NextResponse.next({ request: { headers: requestHeaders } });
            for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
          },
        },
      });
      await supabase.auth.getUser();
    } catch {
      console.error(JSON.stringify({ context: "supabase_session_refresh_failed" }));
    }
  }

  const ref = normalizeReferralCode(searchParams.get("ref"));
  const mode = searchParams.get("mode");
  const cookieBase = {
    path: "/",
    sameSite: "lax" as const,
    secure: request.nextUrl.protocol === "https:",
    maxAge: 60 * 60 * 24 * 90,
  };
  if (ref) {
    if (!request.cookies.get("kb_ref_first")) response.cookies.set("kb_ref_first", ref, cookieBase);
    response.cookies.set("kb_ref_latest", ref, cookieBase);
  }
  if (mode === "domestic" || mode === "export") response.cookies.set("kb_mode", mode, cookieBase);
  if (pathname.startsWith("/admin") || pathname.includes("/agent")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
