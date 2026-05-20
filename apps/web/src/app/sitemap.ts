import { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const certSlugs = [
  "aws-saa-c03", "aws-security-specialty", "az-900", "sc-200",
  "google-cloud-associate", "cka", "ceh", "security-plus", "cissp",
  "oscp", "ccna", "network-plus", "linux-plus", "aws-ml-specialty", "pmp", "itil-foundation",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/categories", "/community", "/leaderboard", "/login", "/signup"];
  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...certSlugs.map((slug) => ({
      url: `${base}/certifications/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
