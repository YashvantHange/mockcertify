"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function DiscussionPage() {
  const { id } = useParams<{ id: string }>();
  const [discussion, setDiscussion] = useState<{
    title: string; body: string; user: { name: string };
    replies: { id: string; body: string; user: { name: string }; createdAt: string }[];
  } | null>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    api<{ discussion: typeof discussion }>(`/community/discussions/${id}`).then((d) => setDiscussion(d.discussion)).catch(console.error);
  }, [id]);

  async function postReply(e: React.FormEvent) {
    e.preventDefault();
    await api(`/community/discussions/${id}/replies`, { method: "POST", body: JSON.stringify({ body: reply }) });
    setReply("");
    const d = await api<{ discussion: typeof discussion }>(`/community/discussions/${id}`);
    setDiscussion(d.discussion);
  }

  if (!discussion) return <div className="p-16 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Card>
        <h1 className="text-xl font-bold">{discussion.title}</h1>
        <p className="text-sm text-slate-500 mt-1">by {discussion.user.name}</p>
        <p className="mt-4 whitespace-pre-wrap">{discussion.body}</p>
      </Card>
      <h2 className="font-semibold mt-8 mb-4">Replies ({discussion.replies.length})</h2>
      <div className="space-y-3">
        {discussion.replies.map((r) => (
          <Card key={r.id}><p className="text-sm font-medium">{r.user.name}</p><p className="mt-1 text-sm">{r.body}</p></Card>
        ))}
      </div>
      <Card className="mt-6">
        <form onSubmit={postReply}>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} required
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-transparent" />
          <Button type="submit" className="mt-2">Reply</Button>
        </form>
      </Card>
    </div>
  );
}
