"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, getGoogleAuthUrl } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
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
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push(redirect.startsWith("/") ? redirect : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Log in to continue practicing</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            />
          </div>
          <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline block">
            Forgot password?
          </Link>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">or</span>
          </div>
        </div>
        {googleEnabled ? (
          <a href={getGoogleAuthUrl()}>
            <Button variant="secondary" className="w-full" type="button">
              Continue with Google
            </Button>
          </a>
        ) : (
          <p className="text-xs text-slate-500 text-center">
            Google sign-in is not configured yet. Use email/password or ask the admin to add Google OAuth keys.
          </p>
        )}
        <p className="mt-6 text-center text-sm text-slate-600">
          No account? <Link href="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-slate-500">Loading...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
