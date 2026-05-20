import { NextResponse } from "next/server";
import { catalogCategories } from "@/data/catalog";
import { hasApiProxy, proxyToApi } from "@/lib/api-proxy";

export async function GET() {
  const proxied = await proxyToApi("/categories");
  if (proxied) return proxied;
  return NextResponse.json({ categories: catalogCategories });
}
