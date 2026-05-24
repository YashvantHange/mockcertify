import { getSiteUrl } from "@/lib/seo";
import { getAllCertSlugsForSitemap } from "@/lib/seo-server";

export type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function buildSitemapEntries(): Promise<SitemapEntry[]> {
  const base = getSiteUrl();
  const lastmod = new Date().toISOString();

  const staticPages: {
    path: string;
    priority: number;
    changefreq: string;
  }[] = [
    { path: "", priority: 1, changefreq: "daily" },
    { path: "/categories", priority: 0.9, changefreq: "daily" },
    { path: "/community", priority: 0.7, changefreq: "daily" },
    { path: "/leaderboard", priority: 0.6, changefreq: "daily" },
    { path: "/about", priority: 0.7, changefreq: "monthly" },
    { path: "/signup", priority: 0.5, changefreq: "monthly" },
    { path: "/login", priority: 0.4, changefreq: "monthly" },
  ];

  const certSlugs = await getAllCertSlugsForSitemap();

  return [
    ...staticPages.map(({ path, priority, changefreq }) => ({
      loc: `${base}${path}`,
      lastmod,
      changefreq,
      priority,
    })),
    ...certSlugs.map((slug) => ({
      loc: `${base}/certifications/${slug}`,
      lastmod,
      changefreq: "weekly",
      priority: 0.8,
    })),
  ];
}

export function entriesToSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
