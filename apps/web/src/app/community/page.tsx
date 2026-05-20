"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Discussion {
  id: string; title: string; body: string; createdAt: string;
  user: { name: string }; _count: { replies: number };
  certification?: { name: string; slug: string };
}

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api<{ discussions: Discussion[] }>("/community/discussions").then((d) => setDiscussions(d.discussions)).catch(console.error);
  }, []);

  async function createDiscussion(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    setError("");
    try {
      await api("/community/discussions", {
        method: "POST",
        body: JSON.stringify({ title, body }),
      });
      setTitle("");
      setBody("");
      const d = await api<{ discussions: Discussion[] }>("/community/discussions");
      setDiscussions(d.discussions);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to post";
      setError(msg === "Unauthorized" ? "Please log in to post a discussion." : msg);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Community</h1>
      <Card className="mb-8">
        <h2 className="font-semibold mb-4">Start a discussion</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={createDiscussion} className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-transparent" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Your question..." required rows={4}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-transparent" />
          <Button type="submit" disabled={posting}>{posting ? "Posting..." : "Post"}</Button>
        </form>
      </Card>
      <div className="space-y-4">
        {discussions.map((d) => (
          <Link key={d.id} href={`/community/${d.id}`}>
            <Card className="hover:border-indigo-400 cursor-pointer">
              <h3 className="font-semibold">{d.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{d.user.name} · {d._count.replies} replies</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
