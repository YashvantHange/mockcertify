"use client";

export function ExamStartOverlay({ label }: { label: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-xl bg-white dark:bg-slate-900 shadow-xl px-8 py-6 flex flex-col items-center gap-4 max-w-sm mx-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center">{label}</p>
        <p className="text-xs text-slate-500 text-center">First load may take a few seconds in dev mode.</p>
      </div>
    </div>
  );
}
