import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { faqJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { HomePageClient } from "./home-page-client";

export const metadata: Metadata = pageMetadata({
  title: "Free IT Certification Practice Exams",
  description:
    "Practice and pass AWS, Azure, Security+, CISSP, CCNA, and 16+ IT certifications with 8,000+ free questions, timed exams, and detailed explanations.",
  path: "/",
  keywords: [
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
      <JsonLd data={[websiteJsonLd(), faqJsonLd()]} />
      <HomePageClient />
    </>
  );
}
