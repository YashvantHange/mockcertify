import { buildSitemapEntries, entriesToSitemapXml } from "@/lib/sitemap-xml";

export const revalidate = 3600;

export async function GET() {
  const entries = await buildSitemapEntries();
  const xml = entriesToSitemapXml(entries);

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
