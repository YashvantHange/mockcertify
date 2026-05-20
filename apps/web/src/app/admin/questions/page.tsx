"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Question {
  id: string;
  title: string;
  difficulty: string;
  certification: { name: string; slug: string };
  domain: { name: string };
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    api<{ questions: Question[] }>("/admin/questions?limit=50")
      .then((d) => setQuestions(d.questions))
      .catch(console.error);
  }, []);

  return (
    <AdminLayout title="Questions">
      <div className="mb-6">
        <Link href="/admin/import">
          <Button>Bulk CSV Import</Button>
        </Link>
      </div>
      <div className="space-y-2 max-h-[70vh] overflow-y-auto">
        {questions.map((q) => (
          <Card key={q.id} className="py-3">
            <p className="font-medium text-sm line-clamp-1">{q.title}</p>
            <p className="text-xs text-slate-500 mt-1">
              {q.certification.name} · {q.domain.name} · {q.difficulty}
            </p>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
