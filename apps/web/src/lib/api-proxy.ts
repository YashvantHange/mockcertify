import { NextResponse } from "next/server";

const PRODUCTION_API = "https://mockcertify-api.onrender.com";

function resolveApiOrigin(): string | undefined {
  const explicit = process.env.API_PROXY_TARGET?.replace(/\/$/, "");
  const explicitOk =
    explicit &&
    !explicit.includes("localhost") &&
    !explicit.includes("trycloudflare.com") &&
    (explicit.includes("onrender.com") ||
      explicit.includes("fly.dev") ||
      explicit.includes("mockcertify.com"));

  if (explicitOk) return explicit;

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return PRODUCTION_API;
  }
  return explicit || undefined;
}

const apiOrigin = resolveApiOrigin();

export function hasApiProxy() {
  return Boolean(apiOrigin && !apiOrigin.includes("localhost"));
}

function forwardResponseHeaders(res: Response, headers: Headers) {
  const contentType = res.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const getSetCookie = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  if (typeof getSetCookie === "function") {
    for (const cookie of getSetCookie.call(res.headers)) {
      headers.append("Set-Cookie", cookie);
    }
  } else {
    const raw = res.headers.get("set-cookie");
    if (raw) headers.append("Set-Cookie", raw);
  }
}

export async function proxyToApi(path: string, init?: RequestInit) {
  if (!apiOrigin) {
    return null;
  }

  const res = await fetch(`${apiOrigin}/api/v1${path}`, {
    ...init,
    cache: "no-store",
    redirect: "manual",
  });

  // OAuth and other flows must reach the browser (e.g. Google needs scope in the URL).
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location");
    if (location) {
      return NextResponse.redirect(location, res.status);
    }
  }

  const body = await res.text();
  const headers = new Headers();
  forwardResponseHeaders(res, headers);
  return new NextResponse(body, { status: res.status, headers });
}
