"use client";

import { useState } from "react";

const STEPS = [
  {
    title: "Log in to Sanity Studio",
    description:
      "Open your Sanity Studio using the link in your deliverables. Use the credentials provided to sign in.",
  },
  {
    title: "Navigate to blog posts",
    description:
      'Once logged in, find "Blog Posts" or "Posts" in the left sidebar. Click it to see your existing content.',
  },
  {
    title: "Create a new post",
    description:
      'Click the "+" or "Create" button. Fill in the title, body content, and any images. Use the rich text editor to format your content.',
  },
  {
    title: "Publish and verify",
    description:
      'Click "Publish" to make your post live. Visit your website to see it appear on the blog page. Changes typically appear within a few seconds.',
  },
];

export function ProjectCmsOnboarding({
  sanityStudioUrl,
}: {
  sanityStudioUrl: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  if (dismissed) return null;

  function markComplete(step: number) {
    const next = new Set(completedSteps);
    next.add(step);
    setCompletedSteps(next);
    if (step < STEPS.length - 1) {
      setCurrentStep(step + 1);
    }
  }

  const allDone = completedSteps.size === STEPS.length;

  return (
    <div className="cms-onboarding-enter space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
            Getting started
          </p>
          <h4 className="mt-1 text-sm font-light tracking-[-0.01em]">
            Set up your CMS in 4 steps
          </h4>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          Dismiss
        </button>
      </div>

      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const isComplete = completedSteps.has(i);
          const isCurrent = i === currentStep && !allDone;

          return (
            <div
              key={i}
              className={`rounded-lg border p-4 transition-colors duration-300 ${
                isCurrent
                  ? "border-primary/30 bg-primary/5"
                  : isComplete
                    ? "border-border/40 bg-muted/30"
                    : "border-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${
                    isComplete
                      ? "bg-emerald-600 text-white step-complete"
                      : isCurrent
                        ? "border-2 border-primary text-primary"
                        : "border border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${isCurrent ? "font-medium" : "font-light"}`}>
                    {step.title}
                  </p>
                  {(isCurrent || isComplete) && (
                    <p className="mt-1.5 text-xs leading-[1.7] text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                  {isCurrent && !isComplete && (
                    <button
                      onClick={() => markComplete(i)}
                      className="group mt-3 inline-flex items-center text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      <span className="relative">
                        Mark as done
                        <span className="absolute inset-x-0 -bottom-px h-px bg-primary/40 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Studio link */}
      <a
        href={sanityStudioUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 text-sm text-foreground transition-all duration-200"
      >
        <span className="relative">
          Open Sanity Studio
          <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary" />
        </span>
        <svg className="h-3.5 w-3.5 text-primary transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>

      {allDone && (
        <div className="rounded-lg status-emerald p-4 text-center">
          <p className="text-sm font-light">
            All set. You can now manage your website content.
          </p>
        </div>
      )}
    </div>
  );
}
