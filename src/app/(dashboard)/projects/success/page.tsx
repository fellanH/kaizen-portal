"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useProjects } from "@/lib/projects-context";
import { slugify } from "@/lib/slugify";
import { CheckCircle2, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = useProjects();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "retrying" | "fallback">("loading");
  const [company, setCompany] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/projects");
      return;
    }

    let redirectTimer: ReturnType<typeof setTimeout>;
    let retryTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const MAX_RETRIES = 10;

    function attempt(count: number) {
      if (cancelled) return;
      api
        .getStripeSession(sessionId!)
        .then((data) => {
          if (cancelled) return;
          setCompany(data.company);
          setStatus("success");
          refresh();
          const slug = slugify(data.company);
          redirectTimer = setTimeout(() => {
            router.push(`/projects/${slug}`);
          }, 2000);
        })
        .catch(() => {
          if (cancelled) return;
          if (count < MAX_RETRIES) {
            setStatus("retrying");
            setRetryCount(count + 1);
            retryTimer = setTimeout(() => attempt(count + 1), 3000);
          } else {
            setStatus("fallback");
            refresh();
            redirectTimer = setTimeout(() => {
              router.push("/projects");
            }, 2000);
          }
        });
    }

    attempt(0);

    return () => {
      cancelled = true;
      clearTimeout(redirectTimer);
      clearTimeout(retryTimer);
    };
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
              Setting up {company ? `your project for ${company}` : "your project"}... You&apos;ll be redirected in a moment.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Redirecting to your project...
            </div>
          </>
        )}

        {status === "retrying" && (
          <>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <h1
              className="text-xl font-light tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Processing your payment...
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-[1.7] text-muted-foreground">
              This usually takes a few seconds. Attempt {retryCount} of 10.
            </p>
          </>
        )}

        {status === "fallback" && (
          <>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <h1
              className="text-xl font-light tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Payment received, redirecting...
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-[1.7] text-muted-foreground">
              Your project will appear in your dashboard shortly.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProjectSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
