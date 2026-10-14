import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const segment = pathname.split("/")[1];
  const lang = segment === "en" ? "en" : "ko";
  const tradeParam = searchParams.get("trade");
  const cookieTrade = request.cookies.get("kb_trade")?.value;
  const trade =
    tradeParam === "export" || tradeParam === "domestic"
      ? tradeParam
      : cookieTrade === "export"
        ? "export"
        : "domestic";

  const existingRef = request.cookies.get("kb_ref")?.value ?? "";
  const incoming = searchParams.get("ref")?.toUpperCase() ?? "";
  const incomingOk = /^[A-Z0-9-]{4,20}$/.test(incoming);
  const ref = /^[A-Z0-9-]{4,20}$/.test(existingRef) ? existingRef : incomingOk ? incoming : "";

  const headers = new Headers(request.headers);
  headers.set("x-kb-lang", lang);
  headers.set("x-kb-trade", trade);
  if (ref) headers.set("x-kb-ref", ref);

  const response = NextResponse.next({ request: { headers } });
  if (tradeParam === "export" || tradeParam === "domestic") {
    response.cookies.set("kb_trade", tradeParam, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 180,
    });
  }
  if (!existingRef && incomingOk) {
    response.cookies.set("kb_ref", incoming, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 90,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|stock/|fonts/).*)"],
};
