import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { getDataSource } from "@/lib/config";
import { absoluteUrl } from "@/lib/http/request-url";
import { createSupabaseServer } from "@/lib/supabase/clients";

export const runtime = "nodejs";

function homePath(request: Request): string {
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const path = new URL(referer).pathname;
      const lang = path.match(/^\/(ko|en|es|fr|km|mn)(\/|$)/)?.[1];
      if (lang) return `/${lang}`;
    } catch {
      // fall through
    }
  }
  return "/ko";
}

export async function POST(request: Request) {
  if (getDataSource() === "supabase") {
    try {
      const supabase = await createSupabaseServer();
      await supabase.auth.signOut();
    } catch {
      // Demo or misconfigured Supabase should still clear the local session cookie.
    }
  }
  const response = NextResponse.redirect(absoluteUrl(request, homePath(request)), 303);
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
