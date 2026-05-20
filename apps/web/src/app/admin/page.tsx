"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function AdminPage() {
  const [stats, setStats] = useState<{ users: number; questions: number; openReports: number; certifications: number } | null>(null);

  useEffect(() => {
    api<typeof stats>("/admin/stats").then(setStats).catch(() => {});
  }, []);

  const links = [
    { href: "/admin/questions", label: "Manage Questions" },
    { href: "/admin/certifications", label: "Certifications" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/reports", label: "Question Reports" },
    { href: "/admin/import", label: "Bulk CSV Import" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      {stats && (
        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          {Object.entries(stats).map(([k, v]) => (
            <Card key={k}><p className="text-2xl font-bold">{v}</p><p className="text-sm text-slate-500 capitalize">{k}</p></Card>
          ))}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href}><Card className="hover:border-indigo-400 cursor-pointer"><h3 className="font-semibold">{l.label}</h3></Card></Link>
        ))}
      </div>
    </div>
  );
}
