import type { MetadataRoute } from "next";
import { siteName, defaultDescription, brandAlternateNames } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — Mock Certify`,
    short_name: siteName,
    description: `${defaultDescription} Also known as ${brandAlternateNames.slice(0, 2).join(", ")}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
  };
}
