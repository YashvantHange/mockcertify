import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import {
  defaultDescription,
  defaultKeywords,
  getSiteUrl,
  organizationJsonLd,
  siteName,
} from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteName} — Free IT Certification Practice Exams`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  applicationName: siteName,
  authors: [{ name: siteName, url: getSiteUrl() }],
  creator: siteName,
  publisher: siteName,
  category: "education",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: `${siteName} — Free IT Certification Practice Exams`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Free IT Certification Practice Exams`,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: getSiteUrl(),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
