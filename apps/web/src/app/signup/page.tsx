"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, getGoogleAuthUrl } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    api<{ googleOAuth: boolean }>("/auth/config")
      .then((d) => setGoogleEnabled(d.googleOAuth))
      .catch(() => setGoogleEnabled(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold mb-2">Create your account</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Free access to all practice features</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
        </form>
        {googleEnabled && (
          <a href={getGoogleAuthUrl()} className="block mt-4">
            <Button variant="secondary" className="w-full" type="button">Continue with Google</Button>
          </a>
        )}
        <p className="mt-6 text-center text-sm">Have an account? <Link href="/login" className="text-indigo-600">Log in</Link></p>
      </Card>
    </div>
  );
}
