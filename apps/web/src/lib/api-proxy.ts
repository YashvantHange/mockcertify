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
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
