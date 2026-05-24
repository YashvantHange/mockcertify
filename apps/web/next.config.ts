import type { NextConfig } from "next";
import path from "path";

const PRODUCTION_API = "https://mockcertify-api.onrender.com";

function resolveRewriteOrigin(): string | undefined {
  const explicit = process.env.API_PROXY_TARGET?.replace(/\/$/, "");
  if (
    explicit &&
    !explicit.includes("localhost") &&
    !explicit.includes("trycloudflare.com") &&
    (explicit.includes("onrender.com") || explicit.includes("fly.dev"))
  ) {
    return explicit;
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return PRODUCTION_API;
  }
  const fallback = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (fallback && fallback.startsWith("http")) return fallback;
  return undefined;
}

const nextConfig: NextConfig = {
  output: process.env.HOSTINGER_BUILD === "1" ? "standalone" : undefined,
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  async rewrites() {
    const apiOrigin = resolveRewriteOrigin();
    if (!apiOrigin) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
