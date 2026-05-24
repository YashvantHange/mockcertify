import { allCertifications, getCertificationBySlug } from "@/data/catalog";

const PRODUCTION_API = "https://mockcertify-api.onrender.com";

function apiBase(): string {
  const explicit = process.env.API_PROXY_TARGET?.replace(/\/$/, "");
  if (explicit?.startsWith("http")) return explicit;
  if (process.env.VERCEL || process.env.NODE_ENV === "production") return PRODUCTION_API;
  return PRODUCTION_API;
}

export type CertSeoData = {
  name: string;
  slug: string;
  provider: string;
  description?: string;
  _count?: { questions: number };
};

/** Fetch certification details for SEO (sitemap + metadata). Falls back to static catalog. */
export async function getCertForSeo(slug: string): Promise<CertSeoData | null> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/certifications/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { certification: CertSeoData };
      return data.certification;
    }
  } catch {
    /* use catalog fallback */
  }

  const fallback = getCertificationBySlug(slug);
  if (!fallback) return null;
  const c = fallback.certification;
  return {
    name: c.name,
    slug: c.slug,
    provider: c.provider,
    description: c.category?.description,
    _count: c._count,
  };
}

export async function getAllCertSlugsForSitemap(): Promise<string[]> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/categories`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        categories: { certifications: { slug: string }[] }[];
      };
      const slugs = data.categories.flatMap((cat) =>
        cat.certifications.map((c) => c.slug)
      );
      if (slugs.length > 0) return [...new Set(slugs)];
    }
  } catch {
    /* catalog fallback */
  }
  return allCertifications.map((c) => c.slug);
}
