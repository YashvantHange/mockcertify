import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, courseJsonLd, pageMetadata } from "@/lib/seo";
import { getCertForSeo } from "@/lib/seo-server";
import { CertificationPageClient } from "./certification-page-client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cert = await getCertForSeo(slug);
  if (!cert) {
    return pageMetadata({
      title: "Certification Not Found",
      path: `/certifications/${slug}`,
      noIndex: true,
    });
  }

  const questionCount = cert._count?.questions ?? 500;
  const title = `${cert.name} Practice Exam — Free ${cert.provider} Questions`;
  const description = `Free ${cert.name} practice test with ${questionCount}+ questions. Timed and practice modes, explanations, and domain-based study for ${cert.provider} certification.`;

  return pageMetadata({
    title,
    description,
    path: `/certifications/${slug}`,
    keywords: [
      `${cert.name} practice exam`,
      `${cert.name} practice questions`,
      `${cert.provider} certification practice`,
      `${cert.slug} mock exam`,
      "free practice test",
    ],
  });
}

export async function generateStaticParams() {
  const { allCertifications } = await import("@/data/catalog");
  return allCertifications.map((c) => ({ slug: c.slug }));
}

export default async function CertificationPage({ params }: Props) {
  const { slug } = await params;
  const cert = await getCertForSeo(slug);
  if (!cert) notFound();

  return (
    <>
      <JsonLd
        data={[
          courseJsonLd(cert),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Certifications", path: "/categories" },
            { name: cert.name, path: `/certifications/${slug}` },
          ]),
        ]}
      />
      <CertificationPageClient />
    </>
  );
}
