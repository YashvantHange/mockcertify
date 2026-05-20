"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Flame, Target, Trophy, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/page-loader";
import { useApi } from "@/hooks/use-api";

const AccuracyChart = dynamic(
  () => import("@/components/dashboard-charts").then((m) => m.AccuracyChart),
  { ssr: false, loading: () => <div className="h-[220px] animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" /> }
);

interface DashboardData {
  user: { name: string; streakCount: number };
  recentAttempts: {
    id: string;
    score: number | null;
    mode: string;
    certification: { name: string; slug: string };
    endedAt: string;
  }[];
  accuracySeries: { date: string; accuracy: number }[];
  weakAreas: { name: string; count: number }[];
  totalAttempts: number;
  averageScore: number;
}

export default function DashboardPage() {
  const { data, isLoading } = useApi<DashboardData>("/analytics/dashboard");

  if (isLoading && !data) return <PageLoader label="Loading dashboard..." />;

  if (!data?.user) return <PageLoader label="Loading dashboard..." />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Welcome back, {data.user.name}</h1>
      <p className="text-slate-600 dark:text-slate-400 mt-1">Track your certification prep progress</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[
          { icon: Flame, label: "Day streak", value: data.user.streakCount },
          { icon: Target, label: "Avg score", value: `${data.averageScore}%` },
          { icon: Trophy, label: "Exams taken", value: data.totalAttempts },
          { icon: BookOpen, label: "Weak areas", value: data.weakAreas.length },
        ].map((s) => (
          <Card key={s.label}>
            <s.icon className="h-8 w-8 text-indigo-600 mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <h2 className="font-semibold mb-4">Accuracy trend</h2>
          <AccuracyChart data={data.accuracySeries} />
        </Card>
        <Card>
          <h2 className="font-semibold mb-4">Weak areas</h2>
          {data.weakAreas.length === 0 ? (
            <p className="text-slate-500 text-sm">Complete exams to see weak areas.</p>
          ) : (
            <ul className="space-y-3">
              {data.weakAreas.map((w) => (
                <li key={w.name} className="flex justify-between text-sm">
                  <span>{w.name}</span>
                  <span className="text-red-500">{w.count} misses</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-8">
        <h2 className="font-semibold mb-4">Recent attempts</h2>
        <div className="space-y-2">
          {data.recentAttempts.map((a) => (
            <Link
              key={a.id}
              href={`/certifications/${a.certification.slug}`}
              prefetch
              className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="font-medium text-sm">{a.certification.name}</span>
              <span className="text-sm text-slate-500">
                {a.mode} · {a.score ?? 0}%
              </span>
            </Link>
          ))}
        </div>
        <Link href="/categories" className="inline-block mt-4">
          <Button>Start new exam</Button>
        </Link>
      </Card>
    </div>
  );
}
