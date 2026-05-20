import { NextResponse } from "next/server";
import { getCertificationBySlug } from "@/data/catalog";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = getCertificationBySlug(slug);
  if (!data) {
    return NextResponse.json({ error: "Certification not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
