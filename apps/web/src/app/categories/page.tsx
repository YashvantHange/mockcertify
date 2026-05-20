"use client";

import Link from "next/link";
import { Cloud, Shield, Network, Brain, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/page-loader";
import { useApi } from "@/hooks/use-api";

const icons: Record<string, React.ElementType> = {
  cloud: Cloud,
  shield: Shield,
  network: Network,
  brain: Brain,
  briefcase: Briefcase,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  certifications: {
    id: string;
    name: string;
    slug: string;
    provider: string;
    _count?: { questions: number };
  }[];
}

export default function CategoriesPage() {
  const { data, isLoading, error } = useApi<{ categories: Category[] }>("/categories");

  if (isLoading && !data) return <PageLoader label="Loading categories..." />;

  const categories = data?.categories ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Certification Categories</h1>
      <p className="text-slate-600 dark:text-slate-400 mt-2">Choose your certification path</p>
      {error && categories.length === 0 && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          Could not load categories from the server. Refresh the page or try again in a moment.
        </p>
      )}
      {!isLoading && categories.length === 0 && !error && (
        <p className="mt-4 text-slate-500">No categories available yet.</p>
      )}
      <div className="mt-10 space-y-12">
        {categories.map((cat) => {
          const Icon = icons[cat.icon] ?? Cloud;
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-3 mb-6">
                <Icon className="h-8 w-8 text-indigo-600" />
                <div>
                  <h2 className="text-xl font-semibold">{cat.name}</h2>
                  <p className="text-sm text-slate-500">{cat.description}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.certifications.map((cert) => (
                  <Link key={cert.id} href={`/certifications/${cert.slug}`} prefetch>
                    <Card className="hover:border-indigo-400 transition-colors h-full">
                      <span className="text-xs text-indigo-600 font-medium">{cert.provider}</span>
                      <h3 className="font-semibold mt-1">{cert.name}</h3>
                      <p className="text-sm text-slate-500 mt-2">
                        {cert._count?.questions ?? 0} questions
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
