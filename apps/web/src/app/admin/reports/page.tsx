"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Report {
  id: string;
  reason: string;
  status: string;
  question: { title: string };
  user: { name: string; email: string };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    api<{ reports: Report[] }>("/admin/reports").then((d) => setReports(d.reports)).catch(console.error);
  }, []);

  async function resolve(id: string) {
    await api(`/admin/reports/${id}`, { method: "PATCH" });
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "RESOLVED" } : r)));
  }

  return (
    <AdminLayout title="Question Reports">
      <div className="space-y-3">
        {reports.length === 0 && <p className="text-slate-500">No reports.</p>}
        {reports.map((r) => (
          <Card key={r.id}>
            <p className="font-medium text-sm">{r.question.title}</p>
            <p className="text-sm text-slate-600 mt-2">{r.reason}</p>
            <p className="text-xs text-slate-400 mt-1">
              {r.user.name} ({r.user.email}) · {r.status}
            </p>
            {r.status === "OPEN" && (
              <Button size="sm" className="mt-3" onClick={() => resolve(r.id)}>
                Mark resolved
              </Button>
            )}
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
