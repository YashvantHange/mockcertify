import type { Metadata } from "next";

const CANONICAL_SITE_URL = "https://www.mockcertify.com";

/** Canonical site URL (no trailing slash). Prefer mockcertify.com over vercel.app for SEO. */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (url && url.startsWith("http") && url.includes("mockcertify.com")) {
    return url;
  }
  return CANONICAL_SITE_URL;
}

export const siteName = "MockCertify";

/** Common brand spellings people type into search (Mock Certify, mock certify, etc.). */
export const brandAlternateNames = [
  "Mock Certify",
  "mock certify",
  "MockCertify.com",
  "mockcertify.com",
  "mockcertify",
] as const;

export const defaultDescription =
  "MockCertify (Mock Certify) offers free IT certification practice exams with 8,000+ questions. Timed and practice modes for AWS, Azure, Security+, CISSP, CCNA, CKA, PMP, and more.";

export const brandKeywords = [
  "MockCertify",
  "Mock Certify",
  "mock certify",
  "mockcertify",
  "mockcertify.com",
  "MockCertify.com",
  "mock certify practice exams",
  "Mock Certify certification",
];

export const defaultKeywords = [
  ...brandKeywords,
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
];

export const brandFaqItems = [
  {
    question: "What is MockCertify?",
    answer:
      "MockCertify is a free online platform for IT certification practice exams. Search for MockCertify, Mock Certify, or mock certify — they all refer to mockcertify.com, where you can take timed and practice-mode exams for AWS, Azure, Security+, CISSP, CCNA, and 16+ certifications.",
  },
  {
    question: "Is Mock Certify the same as MockCertify?",
    answer:
      "Yes. Mock Certify and mock certify are common ways people spell our brand name. The official site is https://www.mockcertify.com — one word, MockCertify.",
  },
  {
    question: "Is MockCertify free?",
    answer:
      "Yes. MockCertify offers free certification practice exams with timed and untimed modes, detailed explanations, and progress tracking.",
  },
  {
    question: "Which certifications does MockCertify cover?",
    answer:
      "MockCertify covers AWS, Microsoft Azure, Google Cloud, Kubernetes (CKA), CompTIA Security+, CISSP, CEH, OSCP, CCNA, Network+, Linux+, PMP, ITIL, and more—with thousands of practice questions.",
  },
  {
    question: "How do timed practice exams work on MockCertify?",
    answer:
      "Choose a certification, pick timed or practice mode, customize question count and domains, then take the exam under realistic time limits with instant scoring and explanations.",
  },
] as const;

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
    "@id": `${url}/#organization`,
    name: siteName,
    alternateName: [...brandAlternateNames],
    url,
    logo: `${url}/opengraph-image`,
    description: defaultDescription,
    brand: {
      "@type": "Brand",
      name: siteName,
      alternateName: [...brandAlternateNames],
    },
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: siteName,
    alternateName: [...brandAlternateNames],
    url,
    description: defaultDescription,
    publisher: { "@id": `${url}/#organization` },
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
    mainEntity: brandFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
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
