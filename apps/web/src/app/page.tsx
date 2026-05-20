"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Zap, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";

interface Certification {
  id: string;
  name: string;
  slug: string;
  provider: string;
  description: string;
  _count?: { questions: number };
}

const testimonials = [
  { name: "Sarah M.", role: "AWS SAA Certified", text: "MockCertify helped me pass SAA-C03 on my first attempt. The timed mode was invaluable." },
  { name: "James K.", role: "Security+ Certified", text: "Weak area analysis pinpointed exactly what I needed to study. Highly recommend." },
  { name: "Priya R.", role: "Azure AZ-900", text: "Clean UI, great explanations, and the community discussions clarified tough concepts." },
];

const features = [
  { icon: Zap, title: "Timed & Practice Modes", desc: "Simulate real exam conditions or learn at your own pace." },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Track accuracy, weak domains, streaks, and progress over time." },
  { icon: Shield, title: "16+ Certifications", desc: "AWS, Azure, Security+, CISSP, CCNA, CKA, PMP, and more." },
];

export default function HomePage() {
  const { data: certData } = useApi<{ certifications: Certification[] }>("/certifications/featured");
  const certs = certData?.certifications ?? [];

  return (
    <>
      <section className="gradient-hero relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 text-sm text-indigo-700 dark:text-indigo-300 mb-6">
              <Star size={14} className="fill-current" /> Trusted by 10,000+ learners
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              Master Your{" "}
              <span className="text-indigo-600">Certification</span> Exams
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
              100% free — practice tests, timed exams, detailed explanations, and analytics for AWS, Azure, Security+, CISSP, and 16+ certifications.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Practicing Free <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="secondary" size="lg">
                  Browse Certifications
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">Why MockCertify?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <f.icon className="h-10 w-10 text-indigo-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Featured Certifications</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {certs.map((cert) => (
              <Link key={cert.id} href={`/certifications/${cert.slug}`}>
                <Card className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer h-full">
                  <span className="text-xs font-medium text-indigo-600">{cert.provider}</span>
                  <h3 className="font-semibold mt-1 line-clamp-2">{cert.name}</h3>
                  <p className="text-sm text-slate-500 mt-2">{cert._count?.questions ?? 0} questions</p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/categories">
              <Button variant="secondary">View all certifications</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-100 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">What learners say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-600">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to pass your exam?</h2>
          <p className="mt-4 text-indigo-100">Join thousands of professionals preparing with MockCertify.</p>
          <Link href="/signup" className="inline-block mt-8">
            <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
              Create free account
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
