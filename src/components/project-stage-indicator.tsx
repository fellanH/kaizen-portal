import { Check } from "lucide-react";

const STAGES = [
  { key: "intake_received", label: "Received" },
  { key: "spec_writing", label: "Scoping" },
  { key: "building", label: "Building" },
  { key: "review", label: "Review" },
  { key: "live", label: "Delivered" },
] as const;

/* Map actual API statuses to the display stage they belong to */
const STATUS_TO_STAGE: Record<string, string> = {
  intake_received: "intake_received",
  spec_writing: "spec_writing",
  spec_ready: "spec_writing",
  building: "building",
  pending_review: "review",
  review_ready: "review",
  approved: "live",
  revising: "building",
  live: "live",
};

export function ProjectStageIndicator({ status }: { status: string }) {
  const mappedStage = STATUS_TO_STAGE[status] || "intake_received";
  const currentIdx = STAGES.findIndex((s) => s.key === mappedStage);

  return (
    <div className="flex items-center gap-0">
      {STAGES.map((stage, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={stage.key} className="flex items-center">
            {i > 0 && (
              <div
                className={`h-px w-5 sm:w-8 transition-colors duration-300 ${
                  isPast || isCurrent ? "bg-primary/40" : "bg-border"
                }`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                  isPast
                    ? "h-5 w-5 bg-primary/15"
                    : isCurrent
                      ? "h-5 w-5 bg-primary/15 ring-2 ring-primary/20 ring-offset-1 ring-offset-background"
                      : "h-5 w-5 bg-muted"
                }`}
              >
                {isPast ? (
                  <Check className="h-3 w-3 text-primary" strokeWidth={2.5} />
                ) : isCurrent ? (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                )}
              </div>
              <span
                className={`hidden text-[11px] sm:inline ${
                  isCurrent
                    ? "font-medium text-foreground"
                    : isPast
                      ? "text-muted-foreground"
                      : "text-muted-foreground/40"
                }`}
              >
                {stage.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
