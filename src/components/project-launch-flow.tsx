"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/lib/api";

/* ── CSS-only animations via inline styles ── */

const fadeUpStyle = (delay = 0): React.CSSProperties => ({
  opacity: 0,
  animation: `kaizen-fade-up 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms forwards`,
});

const fadeInStyle = (delay = 0): React.CSSProperties => ({
  opacity: 0,
  animation: `kaizen-fade-in 800ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms forwards`,
});

/* ── Step 1: Approval confirmation ── */
function StepApproved({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onNext, 2400);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Checkmark circle */}
      <div
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20"
        style={fadeUpStyle(0)}
      >
        <svg
          className="h-10 w-10 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{
            strokeDasharray: 30,
            strokeDashoffset: 30,
            animation: "launch-check-draw 600ms cubic-bezier(0.16, 1, 0.3, 1) 300ms forwards",
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2
        className="text-2xl font-light tracking-[-0.03em] text-foreground sm:text-3xl"
        style={fadeUpStyle(200)}
      >
        Your site is approved
      </h2>
      <p
        className="mt-3 text-sm text-muted-foreground"
        style={fadeUpStyle(400)}
      >
        Now let&apos;s get it live.
      </p>

      {/* Subtle progress bar */}
      <div
        className="mt-10 h-px w-32 overflow-hidden rounded-full bg-border/40"
        style={fadeInStyle(600)}
      >
        <div
          className="h-full bg-primary/60"
          style={{
            width: 0,
            animation: "launch-progress 2000ms cubic-bezier(0.4, 0, 0.2, 1) 400ms forwards",
          }}
        />
      </div>
    </div>
  );
}

/* ── Step 2: Launch checklist ── */
function StepChecklist({
  project,
  onLaunch,
}: {
  project: Project;
  onLaunch: () => void;
}) {
  const [domainChoice, setDomainChoice] = useState<"custom" | "subdomain" | null>(null);

  const previewHost = project.deliverables?.preview_url
    ? project.deliverables.preview_url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    : null;

  return (
    <div className="py-16">
      <div style={fadeUpStyle(0)}>
        <p
          className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60"
        >
          Launch Checklist
        </p>
        <h2 className="mt-1 mb-8 text-2xl font-light tracking-[-0.03em] text-foreground sm:text-3xl">
          Almost there
        </h2>
      </div>

      <div className="space-y-4">
        {/* Item 1: Site approved (done) */}
        <div
          className="flex items-start gap-4 rounded-lg border border-border/60 bg-card p-5"
          style={fadeUpStyle(100)}
        >
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Site approved</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your site has been reviewed and approved.
            </p>
          </div>
        </div>

        {/* Item 2: Domain choice */}
        <div
          className="rounded-lg border border-border/60 bg-card p-5"
          style={fadeUpStyle(200)}
        >
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border/60">
              <span className="text-[10px] text-muted-foreground">2</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Domain</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose how visitors will find your site.
              </p>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setDomainChoice("custom")}
                  className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                    domainChoice === "custom"
                      ? "border-primary/40 bg-primary/[0.04]"
                      : "border-border/60 hover:border-border"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">
                    I have a domain I want to connect
                  </p>
                  {domainChoice === "custom" && previewHost && (
                    <div className="mt-3 space-y-2" style={fadeInStyle(0)}>
                      <p className="text-xs text-muted-foreground">
                        Add a CNAME record pointing to:
                      </p>
                      <div className="overflow-x-auto rounded-md bg-muted/50 px-3 py-2">
                        <code className="text-xs text-foreground/80">{previewHost}</code>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You can connect it now or do this later from your project dashboard.
                      </p>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setDomainChoice("subdomain")}
                  className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                    domainChoice === "subdomain"
                      ? "border-primary/40 bg-primary/[0.04]"
                      : "border-border/60 hover:border-border"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">
                    Use the Kaizen subdomain for now
                  </p>
                  {domainChoice === "subdomain" && previewHost && (
                    <div className="mt-3" style={fadeInStyle(0)}>
                      <div className="overflow-x-auto rounded-md bg-muted/50 px-3 py-2">
                        <code className="text-xs text-foreground/80">{previewHost}</code>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        You can connect a custom domain anytime from your dashboard.
                      </p>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Launch button */}
        <div
          className="pt-4 text-center"
          style={fadeUpStyle(300)}
        >
          <button
            onClick={onLaunch}
            className="group relative inline-flex items-center gap-3 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-[0_0_24px_rgba(232,83,37,0.25)]"
          >
            <span>Launch Website</span>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          {domainChoice === "custom" && (
            <p className="mt-3 text-xs text-muted-foreground" style={fadeInStyle(0)}>
              Don&apos;t worry, you can skip the domain setup and connect it later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Celebration ── */
function StepLaunched({
  project,
  onComplete,
}: {
  project: Project;
  onComplete: () => void;
}) {
  const siteUrl = project.deliverables?.preview_url || "";
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!siteUrl) return;
    navigator.clipboard.writeText(siteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* K mark pulse */}
      <div
        className="mb-10 flex h-16 w-16 items-center justify-center"
        style={{
          opacity: 0,
          animation: "launch-k-pulse 1200ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <span
          className="text-3xl font-light tracking-[-0.04em] text-primary"
          style={{ fontFamily: "var(--font-aspekta)" }}
        >
          K
        </span>
      </div>

      <h2
        className="text-2xl font-light tracking-[-0.03em] text-foreground sm:text-3xl"
        style={fadeUpStyle(400)}
      >
        Your website is live
      </h2>

      {siteUrl && (
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-sm text-primary transition-colors duration-200 hover:text-primary/80"
          style={fadeUpStyle(600)}
        >
          {siteUrl.replace(/^https?:\/\//, "")}
        </a>
      )}

      {/* Share row */}
      <div
        className="mt-8 flex items-center gap-3"
        style={fadeUpStyle(800)}
      >
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2 text-xs text-foreground transition-all duration-200 hover:border-border hover:bg-muted/30"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy URL
            </>
          )}
        </button>
      </div>

      {/* Continue link */}
      <button
        onClick={onComplete}
        className="mt-12 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
        style={fadeUpStyle(1000)}
      >
        <span className="relative">
          Continue to dashboard
          <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary/40" />
        </span>
      </button>
    </div>
  );
}

/* ── Main Launch Flow ── */
export function ProjectLaunchFlow({
  project,
  onComplete,
}: {
  project: Project;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<"approved" | "checklist" | "launched">("approved");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-14">
      {/* Inline keyframes for launch-specific animations */}
      <style>{`
        @keyframes launch-check-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes launch-progress {
          to { width: 100%; }
        }
        @keyframes launch-k-pulse {
          0% { opacity: 0; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
          60% { transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {step === "approved" && (
        <StepApproved onNext={() => setStep("checklist")} />
      )}
      {step === "checklist" && (
        <StepChecklist project={project} onLaunch={() => setStep("launched")} />
      )}
      {step === "launched" && (
        <StepLaunched project={project} onComplete={onComplete} />
      )}
    </div>
  );
}
