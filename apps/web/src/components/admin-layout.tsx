import Link from "next/link";

export function AdminLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link href="/admin" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Back to Admin
      </Link>
      <h1 className="text-2xl font-bold mb-8">{title}</h1>
      {children}
    </div>
  );
}
