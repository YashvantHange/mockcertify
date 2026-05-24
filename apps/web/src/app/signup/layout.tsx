import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign Up Free",
  description:
    "Create a free MockCertify account for unlimited certification practice exams, progress tracking, and analytics.",
  path: "/signup",
  keywords: ["free certification practice account", "sign up practice exams"],
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
