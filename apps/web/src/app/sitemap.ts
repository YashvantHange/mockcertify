import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getAllCertSlugsForSitemap } from "@/lib/seo-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] }[] = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/categories", priority: 0.9, changeFrequency: "daily" },
    { path: "/community", priority: 0.7, changeFrequency: "daily" },
    { path: "/leaderboard", priority: 0.6, changeFrequency: "daily" },
    { path: "/signup", priority: 0.5, changeFrequency: "monthly" },
    { path: "/login", priority: 0.4, changeFrequency: "monthly" },
  ];

  const certSlugs = await getAllCertSlugsForSitemap();

  return [
    ...staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...certSlugs.map((slug) => ({
      url: `${base}/certifications/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
