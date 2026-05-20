import type { NextConfig } from "next";
import path from "path";

const apiOrigin = process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  async rewrites() {
    if (!apiOrigin || apiOrigin.includes("localhost")) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
