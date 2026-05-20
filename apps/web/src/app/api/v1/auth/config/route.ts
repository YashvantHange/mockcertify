import { NextResponse } from "next/server";
import { hasApiProxy, proxyToApi } from "@/lib/api-proxy";

export async function GET() {
  const proxied = await proxyToApi("/auth/config");
  if (proxied) return proxied;
  return NextResponse.json({
    googleOAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    apiConnected: hasApiProxy(),
  });
}
