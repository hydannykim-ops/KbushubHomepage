import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { getDataSource } from "@/lib/config";
import { createSupabaseServer } from "@/lib/supabase/clients";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (getDataSource() === "supabase") {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  }
  const response = NextResponse.redirect(new URL("/ko", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
