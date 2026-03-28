"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useProjects } from "@/lib/projects-context";
import { slugify } from "@/lib/slugify";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ProjectSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = useProjects();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [company, setCompany] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let redirectTimer: ReturnType<typeof setTimeout>;

    api
      .getStripeSession(sessionId)
      .then((data) => {
        setCompany(data.company);
        setStatus("success");
        refresh();
        const slug = slugify(data.company);
        redirectTimer = setTimeout(() => {
          router.push(`/projects/${slug}`);
        }, 2000);
      })
      .catch(() => {
        setStatus("error");
      });

    return () => clearTimeout(redirectTimer);
  }, [sessionId, refresh, router]);

  return (
    <div className="mx-auto max-w-xl px-6 py-10 sm:px-8 sm:py-14">
      <div className="kaizen-enter-1 flex flex-col items-center py-16 text-center">
        {status === "loading" && (
          <>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <h1
              className="text-xl font-light tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Confirming payment...
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h1
              className="text-xl font-light tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Payment confirmed!
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-[1.7] text-muted-foreground">
              Setting up {company ? `your project for ${company}` : "your project"}... You'll be redirected in a moment.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Redirecting to your project...
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h1
              className="text-xl font-light tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Payment received
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-[1.7] text-muted-foreground">
              Your project will appear in your dashboard shortly. It may take a
              moment for everything to sync.
            </p>
            <Link
              href="/projects"
              className="mt-8 inline-flex items-center gap-2 text-sm text-foreground transition-colors duration-200"
            >
              <span className="relative">
                Go to projects
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary/40" />
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
