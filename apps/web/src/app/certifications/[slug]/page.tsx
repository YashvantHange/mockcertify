"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, BookOpen, RotateCcw, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/page-loader";
import { ExamStartOverlay } from "@/components/exam-start-overlay";
import {
  ExamCustomizeModal,
  type ExamCustomizeOptions,
} from "@/components/exam-customize-modal";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { cacheExamStart } from "@/lib/exam-cache";

interface CertDetail {
  certification: {
    id: string;
    name: string;
    slug: string;
    provider: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    domains: { id: string; name: string; slug: string; weightPercent: number }[];
    _count: { questions: number };
  };
  userProgress: { bestScore: number | null; totalAttempts: number } | null;
}

interface StartExamResponse {
  attemptId: string;
  mode: string;
  status: string;
  startedAt: string;
  totalCount: number;
  timeLimitMinutes: number | null;
  questions: unknown[];
}

export default function CertificationPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data, isLoading } = useApi<CertDetail>(`/certifications/${slug}`);
  const [starting, setStarting] = useState<string | null>(null);
  const [startLabel, setStartLabel] = useState("");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [customizeMode, setCustomizeMode] = useState<"PRACTICE" | "TIMED" | null>(null);

  useEffect(() => {
    api<{ user: unknown | null }>("/auth/me")
      .then((d) => setLoggedIn(!!d.user))
      .catch(() => setLoggedIn(false));
  }, []);

  function openCustomize(mode: "PRACTICE" | "TIMED") {
    if (!data) return;
    if (loggedIn === false) {
      router.push(`/login?redirect=/certifications/${slug}`);
      return;
    }
    setCustomizeMode(mode);
  }

  async function startExam(
    mode: "PRACTICE" | "TIMED" | "REVIEW",
    options?: ExamCustomizeOptions
  ) {
    if (!data) return;

    if (loggedIn === false) {
      router.push(`/login?redirect=/certifications/${slug}`);
      return;
    }

    const labels = {
      PRACTICE: "Starting practice exam...",
      TIMED: "Starting timed exam...",
      REVIEW: "Loading review questions...",
    };
    setCustomizeMode(null);
    setStarting(mode);
    setStartLabel(labels[mode]);

    const body: Record<string, unknown> = {
      certificationId: data.certification.id,
      mode,
    };
    if (options) {
      body.questionCount = options.questionCount;
      if (options.timeLimitMinutes != null) {
        body.timeLimitMinutes = options.timeLimitMinutes;
      }
    }

    try {
      const result = await api<StartExamResponse>("/exams/start", {
        method: "POST",
        body: JSON.stringify(body),
      });
      cacheExamStart(result.attemptId, result);
      setStartLabel("Opening exam player...");
      router.push(`/exam/${result.attemptId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to start exam";
      if (msg === "Unauthorized" || msg.includes("401")) {
        router.push(`/login?redirect=/certifications/${slug}`);
      } else {
        alert(msg);
      }
      setStarting(null);
      setStartLabel("");
    }
  }

  if (isLoading && !data) return <PageLoader label="Loading certification..." />;

  if (!data) return <div className="p-16 text-center">Certification not found.</div>;

  const cert = data.certification;
  const maxQuestions = Math.max(5, cert._count.questions);

  return (
    <>
      {starting && <ExamStartOverlay label={startLabel} />}
      {customizeMode && (
        <ExamCustomizeModal
          open
          mode={customizeMode}
          maxQuestions={maxQuestions}
          defaultDurationMinutes={cert.durationMinutes}
          loading={!!starting}
          onClose={() => setCustomizeMode(null)}
          onStart={(opts) => startExam(customizeMode, opts)}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <span className="text-sm font-medium text-indigo-600">{cert.provider}</span>
        <h1 className="text-3xl font-bold mt-1">{cert.name}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-2xl">{cert.description}</p>
        <div className="flex gap-4 mt-4 text-sm text-slate-500">
          <span>{cert._count.questions} questions</span>
          <span>{cert.durationMinutes} min timed</span>
          <span>Pass: {cert.passingScore}%</span>
        </div>
        {data.userProgress && (
          <Card className="mt-6 max-w-md">
            <p className="text-sm">
              Your best score: <strong>{data.userProgress.bestScore ?? 0}%</strong>
            </p>
            <p className="text-sm text-slate-500">{data.userProgress.totalAttempts} attempts</p>
          </Card>
        )}
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          <Card>
            <BookOpen className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold">Practice Mode</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Choose question count and optional timer. Fresh questions each attempt.
            </p>
            <Button
              onClick={() => openCustomize("PRACTICE")}
              disabled={!!starting}
              className="w-full gap-2"
            >
              <Settings2 size={16} />
              {starting === "PRACTICE" ? "Starting..." : "Customize & Start"}
            </Button>
          </Card>
          <Card>
            <Clock className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold">Timed Exam</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Simulate real exam conditions</p>
            <Button
              onClick={() => openCustomize("TIMED")}
              disabled={!!starting}
              className="w-full gap-2"
            >
              <Settings2 size={16} />
              {starting === "TIMED" ? "Starting..." : "Customize & Start"}
            </Button>
          </Card>
          <Card>
            <RotateCcw className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold">Review Mode</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Review missed and flagged questions</p>
            <Button
              variant="secondary"
              onClick={() => startExam("REVIEW")}
              disabled={!!starting}
              className="w-full"
            >
              {starting === "REVIEW" ? "Starting..." : "Start Review"}
            </Button>
          </Card>
        </div>
        <h2 className="text-xl font-semibold mt-12 mb-4">Exam domains</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {cert.domains.map((d) => (
            <Card key={d.id} className="py-4">
              <div className="flex justify-between">
                <span className="font-medium text-sm">{d.name}</span>
                <span className="text-sm text-slate-500">{d.weightPercent}%</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
