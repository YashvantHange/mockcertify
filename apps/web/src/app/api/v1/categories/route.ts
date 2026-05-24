import { NextResponse } from "next/server";
import { catalogCategories } from "@/data/catalog";
import { hasApiProxy, proxyToApi } from "@/lib/api-proxy";

export async function GET() {
  if (hasApiProxy()) {
    try {
      const proxied = await proxyToApi("/categories");
      if (proxied && proxied.status < 500) return proxied;
    } catch {
      /* upstream down — serve static catalog */
    }
  }
  return NextResponse.json({ categories: catalogCategories });
}
