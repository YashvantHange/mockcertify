import type { Metadata } from "next";

/** Canonical site URL (no trailing slash). */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (url && url.startsWith("http")) return url;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://www.mockcertify.com";
}

export const siteName = "MockCertify";

export const defaultDescription =
  "Free IT certification practice exams with 8,000+ questions. Timed and practice modes for AWS, Azure, Security+, CISSP, CCNA, CKA, PMP, and more.";

export const defaultKeywords = [
  "certification practice exams",
  "IT certification prep",
  "free practice tests",
  "AWS practice exam",
  "Azure certification practice",
  "CompTIA Security+ practice",
  "CISSP practice questions",
  "CCNA practice test",
  "mock certification exam",
  "timed exam simulator",
  "cloud certification study",
  "MockCertify",
];

type PageMetaInput = {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
};

/** Build page-level metadata with canonical URL and Open Graph tags. */
export function pageMetadata({
  title,
  description = defaultDescription,
  path = "",
  keywords,
  noIndex = false,
}: PageMetaInput): Metadata {
  const base = getSiteUrl();
  const url = path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;

  return {
    title,
    description,
    keywords: keywords ?? defaultKeywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName,
      title: title.includes(siteName) ? title : `${title} | ${siteName}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: title.includes(siteName) ? title : `${title} | ${siteName}`,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url,
    logo: `${url}/opengraph-image`,
    description: defaultDescription,
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url,
    description: defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/categories?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is MockCertify free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. MockCertify offers free certification practice exams with timed and untimed modes, detailed explanations, and progress tracking.",
        },
      },
      {
        "@type": "Question",
        name: "Which certifications does MockCertify cover?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MockCertify covers AWS, Microsoft Azure, Google Cloud, Kubernetes (CKA), CompTIA Security+, CISSP, CEH, OSCP, CCNA, Network+, Linux+, PMP, ITIL, and more—with thousands of practice questions.",
        },
      },
      {
        "@type": "Question",
        name: "How do timed practice exams work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Choose a certification, pick timed or practice mode, customize question count and domains, then take the exam under realistic time limits with instant scoring and explanations.",
        },
      },
    ],
  };
}

type CertForSchema = {
  name: string;
  slug: string;
  provider: string;
  description?: string;
  _count?: { questions: number };
};

export function courseJsonLd(cert: CertForSchema) {
  const url = getSiteUrl();
  const questionCount = cert._count?.questions ?? 500;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${cert.name} Practice Exam`,
    description:
      cert.description ??
      `Free ${cert.name} practice questions and timed mock exams from ${cert.provider}. ${questionCount}+ questions with explanations.`,
    provider: {
      "@type": "Organization",
      name: cert.provider,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${url}/certifications/${cert.slug}`,
    },
    url: `${url}/certifications/${cert.slug}`,
    educationalLevel: "Professional",
    inLanguage: "en",
    isAccessibleForFree: true,
    numberOfCredits: questionCount,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}
