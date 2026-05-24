import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "IT Certification Categories",
  description:
    "Browse cloud, cybersecurity, networking, AI, and project management certification practice exams. AWS, Azure, Security+, CISSP, CCNA, CKA, PMP, and more.",
  path: "/categories",
  keywords: [
    "certification categories",
    "cloud certification practice",
    "cybersecurity practice exams",
    "networking certification prep",
  ],
});

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
