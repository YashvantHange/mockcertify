import { NextResponse } from "next/server";
import { allCertifications } from "@/data/catalog";
import { proxyToApi } from "@/lib/api-proxy";

export async function GET() {
  const proxied = await proxyToApi("/certifications/featured");
  if (proxied) return proxied;
  return NextResponse.json({ certifications: allCertifications.slice(0, 8) });
}
