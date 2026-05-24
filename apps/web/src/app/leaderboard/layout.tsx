import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Certification Practice Leaderboard",
  description:
    "See top scores on MockCertify practice exams. Compete weekly and track your ranking across IT certification prep.",
  path: "/leaderboard",
});

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
