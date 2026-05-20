import { NextResponse } from "next/server";
import { allCertifications } from "@/data/catalog";

export async function GET() {
  return NextResponse.json({ certifications: allCertifications.slice(0, 8) });
}
