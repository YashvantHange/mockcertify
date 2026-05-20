import { NextResponse } from "next/server";

const apiOrigin = process.env.API_PROXY_TARGET?.replace(/\/$/, "");

export function hasApiProxy() {
  return Boolean(apiOrigin && !apiOrigin.includes("localhost"));
}

export async function proxyToApi(path: string, init?: RequestInit) {
  if (!apiOrigin) {
    return null;
  }
  const res = await fetch(`${apiOrigin}/api/v1${path}`, {
    ...init,
    cache: "no-store",
  });
  const body = await res.text();
  const headers = new Headers();
  const contentType = res.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  // Forward auth cookies from API to the browser (same-origin on Vercel).
  const getSetCookie = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  if (typeof getSetCookie === "function") {
    for (const cookie of getSetCookie.call(res.headers)) {
      headers.append("Set-Cookie", cookie);
    }
  } else {
    const raw = res.headers.get("set-cookie");
    if (raw) headers.append("Set-Cookie", raw);
  }

  return new NextResponse(body, { status: res.status, headers });
}
