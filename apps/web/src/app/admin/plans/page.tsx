"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceDisplay: string;
  features: string[];
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    api<{ plans: Plan[] }>("/admin/plans").then((d) => setPlans(d.plans)).catch(console.error);
  }, []);

  return (
    <AdminLayout title="Subscription Plans">
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p.id}>
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-2xl font-bold mt-2">{p.priceDisplay}</p>
            <ul className="mt-4 text-sm text-slate-600 space-y-1">
              {(p.features as string[]).map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
