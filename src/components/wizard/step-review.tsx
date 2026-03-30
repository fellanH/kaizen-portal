"use client";

import { WizardData, ALL_PAGES, INDUSTRIES, MOODS } from "./types";

interface StepReviewProps {
  data: WizardData;
  onGoToStep: (step: number) => void;
}

function ReviewSection({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-muted/20">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60" style={{ letterSpacing: "0.07em" }}>
          {title}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] text-primary/70 hover:text-primary transition-colors duration-200"
        >
          Edit
        </button>
      </div>
      <div className="px-5 py-4 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <span className="w-32 shrink-0 text-[11px] text-muted-foreground/50">{label}</span>
      <span className="text-sm text-foreground/80 flex-1">{value}</span>
    </div>
  );
}

export function StepReview({ data, onGoToStep }: StepReviewProps) {
  const industryLabel =
    INDUSTRIES.find((i) => i.value === data.company.industry)?.label ??
    data.company.industry;

  const moodLabel =
    MOODS.find((m) => m.key === data.style.mood)?.label ?? data.style.mood;

  const pageLabels = data.pages
    .map((slug) => ALL_PAGES.find((p) => p.value === slug)?.label ?? slug)
    .join(", ");

  const pageMessages = Object.entries(data.content.messages).filter(([, v]) => v.trim());

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Step 5 of 5</p>
        <h2
          className="mt-1 text-xl font-light text-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Review your brief
        </h2>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Everything looks right? Hit build and we will get to work.
        </p>
      </div>

      <div className="space-y-3">
        {/* Company */}
        <ReviewSection title="Company" step={1} onEdit={() => onGoToStep(1)}>
          <ReviewRow label="Name" value={data.company.name} />
          <ReviewRow label="Industry" value={industryLabel} />
          {data.company.url && <ReviewRow label="Current site" value={data.company.url} />}
          <ReviewRow label="Description" value={data.company.description} />
        </ReviewSection>

        {/* Style */}
        <ReviewSection title="Style" step={2} onEdit={() => onGoToStep(2)}>
          <ReviewRow label="Mood" value={moodLabel} />
          {(data.style.references ?? []).length > 0 && (
            <ReviewRow
              label="References"
              value={(data.style.references ?? []).join(", ")}
            />
          )}
        </ReviewSection>

        {/* Pages */}
        <ReviewSection title="Pages" step={3} onEdit={() => onGoToStep(3)}>
          <div className="flex gap-3">
            <span className="w-32 shrink-0 text-[11px] text-muted-foreground/50">
              Selected
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.pages.map((slug) => (
                <span
                  key={slug}
                  className="rounded-md border border-border/50 px-2 py-0.5 text-[11px] text-foreground/70"
                >
                  {ALL_PAGES.find((p) => p.value === slug)?.label ?? slug}
                </span>
              ))}
            </div>
          </div>
        </ReviewSection>

        {/* Content */}
        <ReviewSection title="Content" step={4} onEdit={() => onGoToStep(4)}>
          {pageMessages.map(([slug, msg]) => (
            <ReviewRow
              key={slug}
              label={ALL_PAGES.find((p) => p.value === slug)?.label ?? slug}
              value={msg}
            />
          ))}
          <ReviewRow label="Differentiators" value={data.content.differentiators} />
          <ReviewRow label="Primary CTA" value={data.content.primaryCta} />
          {data.content.secondaryCta && (
            <ReviewRow label="Secondary CTA" value={data.content.secondaryCta} />
          )}
        </ReviewSection>
      </div>

      {/* Launch note */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] px-5 py-4">
        <p className="text-sm font-medium text-foreground">
          Ready to build
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Clicking "Build My Website" will submit your brief to the Kaizen Builder. You will
          be redirected to your projects page where you can track progress.
        </p>
      </div>
    </div>
  );
}
