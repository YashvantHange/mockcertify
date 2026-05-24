import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import {
  brandFaqItems,
  brandKeywords,
  faqJsonLd,
  getSiteUrl,
  pageMetadata,
  siteName,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `About ${siteName} (Mock Certify)`,
  description:
    "Learn about MockCertify — also known as Mock Certify or mock certify. The official free platform for IT certification practice exams at mockcertify.com.",
  path: "/about",
  keywords: [...brandKeywords, "about MockCertify", "what is Mock Certify"],
});

export default function AboutPage() {
  const siteUrl = getSiteUrl();

  return (
    <>
      <JsonLd data={faqJsonLd()} />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          About MockCertify
        </h1>
        <p className="mt-2 text-lg text-indigo-600 dark:text-indigo-400 font-medium">
          Mock Certify · mock certify · {siteUrl.replace("https://", "")}
        </p>

        <div className="mt-8 space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong className="text-slate-900 dark:text-white">MockCertify</strong> is the
            official home for free IT certification practice exams. If you searched for{" "}
            <strong>Mock Certify</strong>, <strong>mock certify</strong>, or{" "}
            <strong>mockcertify.com</strong>, you are in the right place — we are the same
            product, one brand.
          </p>
          <p>
            Our mission is simple: help professionals pass AWS, Azure, Google Cloud,
            CompTIA, CISSP, CCNA, Kubernetes, PMP, and other certifications with realistic
            timed exams, detailed explanations, and progress tracking — at no cost.
          </p>
          <p>
            MockCertify includes 8,000+ practice questions across 16+ certification paths,
            community discussions, leaderboards, and analytics so you can focus on weak
            domains before exam day.
          </p>
        </div>

        <section className="mt-12" aria-labelledby="about-faq">
          <h2 id="about-faq" className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently asked questions
          </h2>
          <dl className="space-y-6">
            {brandFaqItems.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-slate-900 dark:text-white">{item.question}</dt>
                <dd className="mt-2 text-slate-600 dark:text-slate-300">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/signup">
            <Button size="lg">Start practicing free</Button>
          </Link>
          <Link href="/categories">
            <Button variant="secondary" size="lg">
              Browse certifications
            </Button>
          </Link>
        </div>
      </article>
    </>
  );
}
