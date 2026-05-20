import { NextResponse } from "next/server";

/** Fallback: Google OAuth only works when the real API is proxied or deployed. */
export async function GET() {
  const hasGoogle =
    Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const apiProxied = Boolean(
    process.env.API_PROXY_TARGET && !process.env.API_PROXY_TARGET.includes("localhost")
  );
  return NextResponse.json({
    googleOAuth: hasGoogle && apiProxied,
    apiConnected: apiProxied,
  });
}
