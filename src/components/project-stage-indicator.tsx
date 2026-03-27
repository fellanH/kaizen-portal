const STAGES = [
  { key: "intake_received", label: "Received" },
  { key: "spec_writing", label: "Scoping" },
  { key: "building", label: "Building" },
  { key: "review_ready", label: "Review" },
  { key: "live", label: "Delivered" },
] as const;

const stageColors: Record<string, string> = {
  intake_received: "bg-muted-foreground/60",
  spec_writing: "bg-amber-500",
  building: "bg-blue-500",
  review_ready: "bg-primary",
  live: "bg-emerald-500",
};

export function ProjectStageIndicator({ status }: { status: string }) {
  const currentIdx = STAGES.findIndex((s) => s.key === status);
  const dotColor = stageColors[status] || "bg-muted-foreground/60";

  return (
    <div className="flex items-center gap-1.5">
      {STAGES.map((stage, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={stage.key} className="flex items-center gap-1.5">
            {i > 0 && (
              <div
                className={`h-px w-4 sm:w-6 ${
                  isPast || isCurrent ? dotColor : "bg-border"
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`rounded-full transition-all duration-300 ${
                  isCurrent
                    ? `h-2.5 w-2.5 ${dotColor} ring-2 ring-offset-1 ring-offset-background ${dotColor.replace("bg-", "ring-")}/30`
                    : isPast
                      ? `h-2 w-2 ${dotColor}`
                      : "h-2 w-2 bg-border"
                }`}
              />
              <span
                className={`text-[9px] leading-none ${
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
