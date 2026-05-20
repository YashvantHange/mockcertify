"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flag, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExamResults, type ExamResultsData } from "@/components/exam-results";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { readExamStart, clearExamStart } from "@/lib/exam-cache";
import { PageLoader } from "@/components/page-loader";

interface Question {
  questionId: string;
  title: string;
  description?: string;
  difficulty: string;
  domain: { name: string };
  options: { id: string; key: string; text: string }[];
  selectedOptionId?: string | null;
  flagged?: boolean;
}

interface AttemptData {
  attemptId: string;
  mode: string;
  status: string;
  totalCount: number;
  timeLimitMinutes: number | null;
  startedAt: string;
  questions: Question[];
}

type SubmitResult = ExamResultsData & { attemptId?: string; passingScore?: number };

export default function ExamPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [current, setCurrent] = useState(0);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [certSlug, setCertSlug] = useState<string | undefined>();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cached = readExamStart<AttemptData>(attemptId);
    if (cached) {
      setAttempt(cached);
      const c = cached as AttemptData & { certification?: { slug: string } };
      if (c.certification?.slug) setCertSlug(c.certification.slug);
      clearExamStart(attemptId);
      if (cached.timeLimitMinutes && cached.timeLimitMinutes > 0) {
        const elapsed = (Date.now() - new Date(cached.startedAt).getTime()) / 1000;
        setTimeLeft(Math.max(0, cached.timeLimitMinutes * 60 - elapsed));
      }
      return;
    }

    api<{ attempt: {
      id: string; mode: string; status: string; totalCount: number; startedAt: string;
      timeLimitMinutes: number | null;
      certification: { durationMinutes: number; slug: string };
      answers: { questionId: string; selectedOptionId?: string; flagged: boolean;
        question: { id: string; title: string; description?: string; difficulty: string;
          domain: { name: string }; options: { id: string; key: string; text: string }[] } }[];
    } }>(`/exams/${attemptId}`)
      .then(({ attempt: a }) => {
        if (a.status === "COMPLETED") { router.push("/dashboard"); return; }
        const questions: Question[] = a.answers.map((ans) => ({
          questionId: ans.question.id,
          title: ans.question.title,
          description: ans.question.description,
          difficulty: ans.question.difficulty,
          domain: ans.question.domain,
          options: ans.question.options,
          selectedOptionId: ans.selectedOptionId,
          flagged: ans.flagged,
        }));
        setCertSlug(a.certification.slug);
        setAttempt({
          attemptId,
          mode: a.mode,
          status: a.status,
          totalCount: a.totalCount,
          timeLimitMinutes: a.timeLimitMinutes ?? null,
          startedAt: a.startedAt,
          questions,
        });
        if (a.timeLimitMinutes && a.timeLimitMinutes > 0) {
          const elapsed = (Date.now() - new Date(a.startedAt).getTime()) / 1000;
          setTimeLeft(Math.max(0, a.timeLimitMinutes * 60 - elapsed));
        }
      })
      .catch(() => router.push("/dashboard"));
  }, [attemptId, router]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => (s !== null && s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  useEffect(() => {
    if (attempt?.timeLimitMinutes && timeLeft === 0 && attempt && !submitResult) {
      submitExam();
    }
  }, [timeLeft, attempt?.timeLimitMinutes]);

  const q = attempt?.questions[current];

  function saveAnswer(questionId: string, selectedOptionId?: string, flagged?: boolean) {
    if (!attempt) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      api(`/exams/${attemptId}/answer`, {
        method: "PATCH",
        body: JSON.stringify({ questionId, selectedOptionId, flagged }),
      }).catch(console.error);
    }, 300);
  }

  function selectOption(optionId: string) {
    if (!attempt || !q) return;
    const updated = [...attempt.questions];
    updated[current] = { ...q, selectedOptionId: optionId };
    setAttempt({ ...attempt, questions: updated });
    saveAnswer(q.questionId, optionId);
  }

  function toggleFlag() {
    if (!attempt || !q) return;
    const updated = [...attempt.questions];
    updated[current] = { ...q, flagged: !q.flagged };
    setAttempt({ ...attempt, questions: updated });
    saveAnswer(q.questionId, q.selectedOptionId ?? undefined, !q.flagged);
  }

  async function submitExam() {
    if (submitResult) return;
    try {
      const result = await api<SubmitResult>(`/exams/${attemptId}/submit`, { method: "POST" });
      setSubmitResult(result);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Submit failed");
    }
  }

  if (submitResult) {
    return <ExamResults data={submitResult} certificationSlug={certSlug} />;
  }

  if (!attempt || !q) return <PageLoader label="Loading exam..." />;

  const mins = timeLeft !== null ? Math.floor(timeLeft / 60) : 0;
  const secs = timeLeft !== null ? Math.floor(timeLeft % 60) : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <aside className="lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-4">
        <p className="text-sm font-medium mb-3">Questions</p>
        <div className="flex flex-wrap lg:flex-col gap-2">
          {attempt.questions.map((qu, i) => (
            <button key={qu.questionId} onClick={() => setCurrent(i)}
              className={cn("w-9 h-9 rounded-lg text-sm font-medium border",
                i === current ? "bg-indigo-600 text-white border-indigo-600" :
                qu.selectedOptionId ? "bg-green-100 dark:bg-green-900/30 border-green-300" :
                qu.flagged ? "bg-amber-100 border-amber-300" : "border-slate-200 dark:border-slate-700")}>
              {i + 1}
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 p-4 lg:p-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-slate-500">Q{current + 1}/{attempt.totalCount} · {q.domain.name} · {q.difficulty}</span>
          {timeLeft !== null && attempt.timeLimitMinutes != null && (
            <span className="font-mono text-lg font-bold text-indigo-600">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          )}
        </div>
        <h2 className="text-xl font-semibold">{q.title}</h2>
        {q.description && <p className="text-slate-600 mt-2">{q.description}</p>}
        <div className="mt-6 space-y-3">
          {q.options.map((opt) => (
            <button key={opt.id} onClick={() => selectOption(opt.id)}
              className={cn("w-full text-left p-4 rounded-lg border transition-colors",
                q.selectedOptionId === opt.id ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700 hover:border-indigo-300")}>
              <span className="font-medium mr-2">{opt.key}.</span>{opt.text}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={toggleFlag} className={q.flagged ? "text-amber-600" : ""}>
            <Flag size={18} className="mr-1" /> {q.flagged ? "Flagged" : "Flag"}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              <ChevronLeft size={18} />
            </Button>
            {current < attempt.questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => c + 1)}>Next <ChevronRight size={18} /></Button>
            ) : (
              <Button onClick={submitExam}><Send size={18} className="mr-1" /> Submit</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
