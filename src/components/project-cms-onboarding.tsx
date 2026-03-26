"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="cms-onboarding-enter space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium">Get started with your CMS</h4>
          <p className="text-xs text-muted-foreground">
            Learn to edit your website content in 4 steps
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-xs text-muted-foreground"
        >
          Dismiss
        </Button>
      </div>

      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const isComplete = completedSteps.has(i);
          const isCurrent = i === currentStep && !allDone;

          return (
            <div
              key={i}
              className={`rounded-lg border p-3 transition-colors duration-300 ${
                isCurrent
                  ? "border-primary/50 bg-primary/5"
                  : isComplete
                    ? "border-transparent bg-muted/50"
                    : "border-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step indicator */}
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${
                    isComplete
                      ? "bg-green-600 text-white step-complete"
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
                  <p className={`text-sm ${isCurrent ? "font-medium" : ""}`}>
                    {step.title}
                  </p>
                  {(isCurrent || isComplete) && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                  {isCurrent && !isComplete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markComplete(i)}
                      className="mt-2 text-xs"
                    >
                      Mark as done
                    </Button>
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
        className="inline-block"
      >
        <Button variant="outline" size="sm" className="text-xs">
          Open Sanity Studio
        </Button>
      </a>

      {allDone && (
        <div className="rounded-lg bg-green-600/10 p-3 text-center">
          <p className="text-sm font-medium text-green-600">
            You're all set! You can now manage your website content.
          </p>
        </div>
      )}
    </div>
  );
}
