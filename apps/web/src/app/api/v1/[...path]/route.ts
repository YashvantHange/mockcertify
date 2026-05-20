import { NextResponse } from "next/server";
import { hasApiProxy, proxyToApi } from "@/lib/api-proxy";

type Ctx = { params: Promise<{ path: string[] }> };

async function forward(req: Request, { params }: Ctx) {
  const segments = (await params).path;
  const path = `/${segments.join("/")}`;
  const url = new URL(req.url);
  const qs = url.search;
  const target = `${path}${qs}`;

  if (!hasApiProxy()) {
    return NextResponse.json(
      { error: "API not configured. Deploy the backend on Render." },
      { status: 503 }
    );
  }

  const proxied = await proxyToApi(target, {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  });
  return proxied ?? NextResponse.json({ error: "Proxy failed" }, { status: 502 });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
