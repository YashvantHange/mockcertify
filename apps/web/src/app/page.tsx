import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { brandKeywords, faqJsonLd, pageMetadata, siteName } from "@/lib/seo";
import { HomePageClient } from "./home-page-client";

export const metadata: Metadata = pageMetadata({
  title: `${siteName} (Mock Certify) — Free IT Certification Practice Exams`,
  description:
    "Looking for Mock Certify or mock certify? MockCertify is the official free site for IT certification practice exams — 8,000+ questions for AWS, Azure, Security+, CISSP, CCNA, and more.",
  path: "/",
  keywords: [
    ...brandKeywords,
    "free certification practice exams",
    "IT certification practice test",
    "AWS SAA practice exam",
    "Security+ practice questions",
    "Azure AZ-900 practice",
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd()} />
      <HomePageClient />
    </>
  );
}
