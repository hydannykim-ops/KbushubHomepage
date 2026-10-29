import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHost: string | null = null;
if (supabaseUrl) {
  try {
    supabaseHost = new URL(supabaseUrl).hostname;
  } catch {
    supabaseHost = null;
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Cloud Agent / port-forward clients often hit 127.0.0.1 or a tunnel host.
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.cursor.sh", "*.cursorapi.com"],
  experimental: {
    agentUpgrade: "security",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/**" }]
      : [],
  },
};

export default nextConfig;
