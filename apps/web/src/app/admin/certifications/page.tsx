"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

interface Cert {
  id: string;
  name: string;
  slug: string;
  provider: string;
  isActive: boolean;
  _count: { questions: number; domains: number };
}

export default function AdminCertificationsPage() {
  const [certs, setCerts] = useState<Cert[]>([]);

  useEffect(() => {
    api<{ certifications: Cert[] }>("/admin/certifications")
      .then((d) => setCerts(d.certifications))
      .catch(console.error);
  }, []);

  return (
    <AdminLayout title="Certifications">
      <div className="grid sm:grid-cols-2 gap-4">
        {certs.map((c) => (
          <Card key={c.id}>
            <p className="text-xs text-indigo-600">{c.provider}</p>
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm text-slate-500 mt-2">
              {c._count.questions} questions · {c._count.domains} domains
            </p>
            <Link
              href={`/certifications/${c.slug}`}
              className="text-sm text-indigo-600 hover:underline mt-2 inline-block"
            >
              View public page →
            </Link>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
