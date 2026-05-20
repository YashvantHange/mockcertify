"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ExamResultItem {
  questionId: string;
  title: string;
  isCorrect: boolean;
  difficulty?: string;
  domain?: { name: string };
  explanation?: { body: string; referenceLinks: string[] };
  options: { id: string; key: string; text: string; isCorrect: boolean }[];
  correctOptionId?: string;
  selectedOptionId?: string | null;
}

export interface ExamResultsData {
  score: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  passingScore?: number;
  results: ExamResultItem[];
}

type Filter = "all" | "correct" | "incorrect";

function stripMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[(Easy|Moderate|Hard)\]\s*/gi, "")
    .trim();
}

function formatDifficulty(d?: string) {
  if (!d) return null;
  const map: Record<string, string> = {
    EASY: "Easy",
    MEDIUM: "Moderate",
    HARD: "Hard",
  };
  return map[d] ?? d;
}

function difficultyColor(d?: string) {
  switch (d) {
    case "EASY":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "HARD":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

function QuestionReviewCard({
  index,
  item,
  defaultExpanded,
}: {
  index: number;
  item: ExamResultItem;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const skipped = !item.selectedOptionId;
  const title = stripMarkdown(item.title);

  return (
    <Card
      className={cn(
        "overflow-hidden p-0",
        item.isCorrect
          ? "border-green-200 dark:border-green-900/50"
          : "border-red-200 dark:border-red-900/50"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            item.isCorrect
              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
              : skipped
                ? "bg-slate-100 text-slate-600 dark:bg-slate-800"
                : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
          )}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {item.isCorrect ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                <CheckCircle2 size={14} /> Correct
              </span>
            ) : skipped ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <MinusCircle size={14} /> Skipped
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400">
                <XCircle size={14} /> Incorrect
              </span>
            )}
            {item.difficulty && (
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", difficultyColor(item.difficulty))}>
                {formatDifficulty(item.difficulty)}
              </span>
            )}
            {item.domain?.name && (
              <span className="text-xs text-slate-500 truncate max-w-[200px]">{item.domain.name}</span>
            )}
          </div>
          <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">{title}</p>
        </div>
        {expanded ? <ChevronUp size={18} className="shrink-0 text-slate-400 mt-1" /> : <ChevronDown size={18} className="shrink-0 text-slate-400 mt-1" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-800 dark:text-slate-200 mb-4 leading-relaxed">{title}</p>

          <div className="space-y-2">
            {item.options.map((opt) => {
              const isCorrect = opt.isCorrect;
              const isSelected = opt.id === item.selectedOptionId;
              const isWrongPick = isSelected && !isCorrect;

              return (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
                    isCorrect && "border-green-500 bg-green-50/80 dark:bg-green-950/30",
                    isWrongPick && "border-red-500 bg-red-50/80 dark:bg-red-950/30",
                    !isCorrect && !isWrongPick && "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isCorrect && "bg-green-600 text-white",
                      isWrongPick && "bg-red-600 text-white",
                      !isCorrect && !isWrongPick && "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    )}
                  >
                    {opt.key}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 dark:text-slate-200">{opt.text}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {isCorrect && (
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">Correct answer</span>
                      )}
                      {isWrongPick && (
                        <span className="text-xs font-medium text-red-700 dark:text-red-400">Your answer</span>
                      )}
                      {isSelected && isCorrect && (
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">Your answer</span>
                      )}
                    </div>
                  </div>
                  {isCorrect && <CheckCircle2 size={18} className="shrink-0 text-green-600" />}
                  {isWrongPick && <XCircle size={18} className="shrink-0 text-red-600" />}
                </div>
              );
            })}
          </div>

          {item.explanation?.body && (
            <div className="mt-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 px-4 py-3">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-2">
                Explanation
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {stripMarkdown(item.explanation.body)}
              </p>
              {item.explanation.referenceLinks?.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.explanation.referenceLinks.map((link) => (
                    <li key={link}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {link.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function ExamResults({ data, certificationSlug }: { data: ExamResultsData; certificationSlug?: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const incorrect = data.totalCount - data.correctCount;
  const skipped = data.results.filter((r) => !r.selectedOptionId).length;

  const filtered = useMemo(() => {
    if (filter === "correct") return data.results.filter((r) => r.isCorrect);
    if (filter === "incorrect") return data.results.filter((r) => !r.isCorrect);
    return data.results;
  }, [data.results, filter]);

  const scoreColor =
    data.score >= (data.passingScore ?? 72)
      ? "text-green-600"
      : data.score >= 50
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <Card className="text-center mb-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
          style={{
            background: `conic-gradient(from 0deg, ${
              data.passed ? "#16a34a" : "#6366f1"
            } ${data.score * 3.6}deg, transparent ${data.score * 3.6}deg)`,
          }}
        />
        <div className="relative">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Exam complete</p>
          <p className={cn("text-5xl font-bold mt-2 tabular-nums", scoreColor)}>{data.score}%</p>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            <span className="font-semibold text-green-600">{data.correctCount}</span> correct ·{" "}
            <span className="font-semibold text-red-600">{incorrect}</span> incorrect
            {skipped > 0 && (
              <>
                {" "}
                · <span className="font-semibold text-slate-500">{skipped}</span> skipped
              </>
            )}
          </p>
          <p
            className={cn(
              "mt-3 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
              data.passed
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            )}
          >
            {data.passed ? "Passed — great job!" : "Keep practicing — review incorrect answers below"}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Button onClick={() => router.push("/dashboard")}>
              <LayoutDashboard size={16} className="mr-2" /> Back to dashboard
            </Button>
            {certificationSlug && (
              <Button variant="secondary" onClick={() => router.push(`/certifications/${certificationSlug}`)}>
                <RotateCcw size={16} className="mr-2" /> Try again
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["all", `All (${data.totalCount})`],
            ["correct", `Correct (${data.correctCount})`],
            ["incorrect", `Incorrect (${incorrect})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              filter === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No questions in this filter.</p>
        ) : (
          filtered.map((item) => {
            const index = data.results.findIndex((r) => r.questionId === item.questionId);
            return (
              <QuestionReviewCard
                key={item.questionId}
                index={index}
                item={item}
                defaultExpanded={!item.isCorrect}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
