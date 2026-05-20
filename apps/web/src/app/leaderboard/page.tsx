"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"WEEKLY" | "ALL_TIME">("WEEKLY");
  const [entries, setEntries] = useState<{ rank: number; score: number; user: { name: string } }[]>([]);

  useEffect(() => {
    api<{ entries: typeof entries }>(`/leaderboards?period=${period}`)
      .then((d) => setEntries(d.entries)).catch(console.error);
  }, [period]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <div className="flex gap-2 mb-6">
        {(["WEEKLY", "ALL_TIME"] as const).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${period === p ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
            {p === "WEEKLY" ? "This week" : "All time"}
          </button>
        ))}
      </div>
      <Card>
        {entries.length === 0 ? (
          <p className="text-slate-500 text-sm">No entries yet. Complete timed exams to rank!</p>
        ) : (
          <ol className="space-y-3">
            {entries.map((e) => (
              <li key={e.rank} className="flex justify-between items-center">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm font-bold">{e.rank}</span>
                  {e.user.name}
                </span>
                <span className="font-semibold">{e.score} pts</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
