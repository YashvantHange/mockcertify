"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const links = [
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/community", label: "Community" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    api<{ user: { name: string; role: string } | null }>("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      /* clear client state anyway */
    }
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl"
          aria-label="MockCertify home — Mock Certify practice exams"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm"
            aria-hidden
          >
            MC
          </span>
          <span className="text-slate-900 dark:text-white">MockCertify</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-indigo-600",
                pathname === l.href ? "text-indigo-600" : "text-slate-600 dark:text-slate-300"
              )}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-indigo-600",
                pathname.startsWith("/dashboard") ? "text-indigo-600" : "text-slate-600 dark:text-slate-300"
              )}
            >
              Dashboard
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium transition-colors hover:text-indigo-600",
                pathname.startsWith("/admin") ? "text-indigo-600" : "text-slate-600 dark:text-slate-300"
              )}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          {user ? (
            <>
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden lg:inline">
                {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-1">
                <LogOut size={16} /> Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up free</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block py-2" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user && (
            <Link href="/dashboard" className="block py-2" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="block py-2" onClick={() => setOpen(false)}>
              Admin
            </Link>
          )}
          {user ? (
            <Button variant="secondary" className="w-full" onClick={() => { setOpen(false); logout(); }}>
              Log out
            </Button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="secondary" className="w-full">Log in</Button>
              </Link>
              <Link href="/signup" className="flex-1" onClick={() => setOpen(false)}>
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
