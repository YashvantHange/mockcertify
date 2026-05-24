import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Certification Study Community",
  description:
    "Discuss exam topics, share study tips, and get help from other learners preparing for AWS, Azure, Security+, and other IT certifications.",
  path: "/community",
  keywords: ["certification study community", "exam discussion forum", "IT certification help"],
});

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
