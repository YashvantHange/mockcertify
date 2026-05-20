import { NextResponse } from "next/server";
import { catalogCategories } from "@/data/catalog";

/** Fallback when API proxy is not configured on Vercel. */
export async function GET() {
  return NextResponse.json({ categories: catalogCategories });
}
