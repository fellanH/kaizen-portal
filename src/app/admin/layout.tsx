"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "fehellstrom@gmail.com";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-foreground/40 text-sm">Loading...</div>
      </div>
    );
  }

  if (email !== ADMIN_EMAIL) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-foreground/10 bg-background px-4 py-6">
        <div className="mb-8">
          <span className="text-xs font-medium tracking-[0.08em] uppercase text-primary">
            Kaizen
          </span>
          <h2 className="mt-1 text-lg font-medium text-foreground">Admin</h2>
        </div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/admin"
            className="rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Projects
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
