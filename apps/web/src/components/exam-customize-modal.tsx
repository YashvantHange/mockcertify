"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface ExamCustomizeOptions {
  questionCount: number;
  timeLimitMinutes: number | null;
}

interface ExamCustomizeModalProps {
  open: boolean;
  onClose: () => void;
  onStart: (options: ExamCustomizeOptions) => void;
  mode: "PRACTICE" | "TIMED";
  maxQuestions: number;
  defaultDurationMinutes: number;
  loading?: boolean;
}

const QUESTION_PRESETS = [10, 15, 20, 30, 40, 50, 65];

const TIME_PRESETS = [
  { label: "No timer", value: 0 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

export function ExamCustomizeModal({
  open,
  onClose,
  onStart,
  mode,
  maxQuestions,
  defaultDurationMinutes,
  loading,
}: ExamCustomizeModalProps) {
  const questionOptions = useMemo(() => {
    const opts = QUESTION_PRESETS.filter((n) => n <= maxQuestions);
    if (!opts.includes(maxQuestions) && maxQuestions >= 5) opts.push(maxQuestions);
    return [...new Set(opts)].sort((a, b) => a - b);
  }, [maxQuestions]);

  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(mode === "TIMED" ? defaultDurationMinutes : 0);
  const [customTime, setCustomTime] = useState("");

  useEffect(() => {
    if (!open) return;
    const defaultQ = Math.min(20, maxQuestions);
    setQuestionCount(defaultQ >= 5 ? defaultQ : 5);
    setTimeLimit(mode === "TIMED" ? defaultDurationMinutes : 0);
    setCustomTime("");
  }, [open, mode, maxQuestions, defaultDurationMinutes]);

  if (!open) return null;

  const effectiveMax = Math.max(5, maxQuestions);
  const safeCount = Math.min(Math.max(5, questionCount), effectiveMax);

  function handleStart() {
    let minutes: number | null = timeLimit;
    if (timeLimit === -1) {
      const parsed = parseInt(customTime, 10);
      minutes = parsed > 0 ? Math.min(240, parsed) : null;
    }
    if (minutes === 0) minutes = null;
    onStart({ questionCount: safeCount, timeLimitMinutes: minutes });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <Card className="w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold pr-8">
          {mode === "PRACTICE" ? "Customize practice exam" : "Customize timed exam"}
        </h2>
        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
          <Shuffle size={14} className="text-indigo-500" />
          Fresh questions — avoids repeats from your recent attempts
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of questions
              <span className="text-slate-400 font-normal ml-1">(max {effectiveMax})</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {questionOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuestionCount(n)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    safeCount === n
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={5}
              max={effectiveMax}
              value={safeCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-center text-sm font-semibold text-indigo-600 mt-1">{safeCount} questions</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time limit</label>
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTimeLimit(t.value);
                    setCustomTime("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    timeLimit === t.value
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              {mode === "TIMED" && (
                <button
                  type="button"
                  onClick={() => setTimeLimit(defaultDurationMinutes)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    timeLimit === defaultDurationMinutes
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Exam default ({defaultDurationMinutes}m)
                </button>
              )}
              <button
                type="button"
                onClick={() => setTimeLimit(-1)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  timeLimit === -1
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                Custom
              </button>
            </div>
            {timeLimit === -1 && (
              <input
                type="number"
                min={1}
                max={240}
                placeholder="Minutes"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleStart} disabled={loading}>
            {loading ? "Starting..." : "Start exam"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
