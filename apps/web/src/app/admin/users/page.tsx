"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  streakCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api<{ users: User[] }>("/admin/users").then((d) => setUsers(d.users)).catch(console.error);
  }, []);

  async function toggleRole(user: User) {
    const role = user.role === "ADMIN" ? "USER" : "ADMIN";
    await api(`/admin/users/${user.id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
  }

  return (
    <AdminLayout title="Users">
      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-slate-500">{u.email}</p>
              <p className="text-xs text-slate-400 mt-1">Role: {u.role} · Streak: {u.streakCount}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toggleRole(u)}>
              {u.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
            </Button>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
