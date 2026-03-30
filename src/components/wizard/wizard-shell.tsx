"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const STEPS = [
  { number: 1, label: "Company" },
  { number: 2, label: "Style" },
  { number: 3, label: "Pages" },
  { number: 4, label: "Content" },
  { number: 5, label: "Review" },
];

interface WizardShellProps {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  children: React.ReactNode;
}

export function WizardShell({
  currentStep,
  onBack,
  onNext,
  canNext,
  isLastStep = false,
  isSubmitting = false,
  nextLabel,
  children,
}: WizardShellProps) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-14">
      {/* Header */}
      <div className="kaizen-enter-1 space-y-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/projects"
            className="transition-colors duration-200 hover:text-foreground"
          >
            Projects
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground">New Project</span>
        </nav>
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60"
            style={{ letterSpacing: "0.08em" }}
          >
            Get started
          </p>
          <h1
            className="mt-1 text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            Build Your Website
          </h1>
        </div>
        <div className="kaizen-line h-px bg-border" />
      </div>

      {/* Step indicator */}
      <div className="mt-8 space-y-3">
        {/* Labels */}
        <div className="flex justify-between">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-1">
              <span
                className={`text-[10px] font-medium uppercase tracking-wider transition-colors duration-300 ${
                  step.number === currentStep
                    ? "text-foreground"
                    : step.number < currentStep
                    ? "text-muted-foreground"
                    : "text-muted-foreground/40"
                }`}
                style={{ letterSpacing: "0.07em" }}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="relative h-px bg-border">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Step dots */}
          <div className="absolute inset-0 flex items-center justify-between">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  step.number < currentStep
                    ? "bg-primary"
                    : step.number === currentStep
                    ? "bg-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-background"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="mt-10">{children}</div>

      {/* Navigation */}
      <div className="mt-10 border-t border-border/50 pt-6">
        <div className="flex items-center justify-between">
          {currentStep === 1 ? (
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              Cancel
            </Link>
          ) : (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={!canNext || isSubmitting}
            className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-30 ${
              isLastStep
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.10] border border-border/60"
            }`}
          >
            {isSubmitting ? (
              <>
                <span
                  className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
                  aria-hidden="true"
                />
                Building...
              </>
            ) : (
              nextLabel ?? (isLastStep ? "Build My Website" : "Continue")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
