/** Build a browser-reachable origin from proxy / Host headers (avoid 0.0.0.0). */
export function requestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = forwardedHost || request.headers.get("host")?.trim() || "";
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (hostHeader) {
    const host = hostHeader.replace(/^0\.0\.0\.0(?=:|$)/, "127.0.0.1");
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const proto = forwardedProto || (isLocal ? "http" : "https");
    return `${proto}://${host}`;
  }

  try {
    const url = new URL(request.url);
    if (url.hostname === "0.0.0.0") url.hostname = "127.0.0.1";
    return url.origin;
  } catch {
    return "http://127.0.0.1:3000";
  }
}

export function absoluteUrl(request: Request, path: string): URL {
  return new URL(path, `${requestOrigin(request)}/`);
}
