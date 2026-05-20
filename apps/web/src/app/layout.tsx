import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "MockCertify — Certification Exam Practice Platform",
    template: "%s | MockCertify",
  },
  description:
    "Practice tests and timed exams for AWS, Azure, Security+, CISSP, CCNA, and 16+ IT certifications.",
  keywords: ["certification", "practice exams", "AWS", "Azure", "Security+"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MockCertify",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "MockCertify",
              url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
              description: "IT certification practice exam platform",
            }),
          }}
        />
      </body>
    </html>
  );
}
