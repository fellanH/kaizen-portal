"use client";

const STAGES = [
  { key: "intake_received", label: "Received" },
  { key: "spec_writing", label: "Spec Writing" },
  { key: "building", label: "Building" },
  { key: "review_ready", label: "Review" },
  { key: "live", label: "Live" },
];

function stageIndex(status: string) {
  const idx = STAGES.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export function ProjectProgressTracker({
  status,
  createdAt,
  updatedAt,
  tier,
}: {
  status: string;
  createdAt: string;
  updatedAt: string;
  tier: string;
}) {
  const current = stageIndex(status);
  const totalStages = STAGES.length;
  const completionPercent = Math.round(
    ((status === "live" ? totalStages : current) / (totalStages - 1)) * 100
  );

  const tierDays: Record<string, number> = {
    starter: 3,
    professional: 5,
    premium: 10,
  };
  const estimatedDays = tierDays[tier] || 5;

  return (
    <div className="space-y-4">
      {/* Overall progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span className="font-medium text-foreground">{completionPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="progress-bar-fill h-full rounded-full bg-primary"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex items-start justify-between gap-1 py-2">
        {STAGES.map((stage, i) => {
          const isCompleted = i < current;
          const isCurrent = i === current;
          const isLive = status === "live" && i === totalStages - 1;

          return (
            <div key={stage.key} className="flex flex-1 flex-col items-center">
              <div className="relative flex items-center justify-center">
                {/* Connecting line (before the circle) */}
                {i > 0 && (
                  <div
                    className={`absolute right-1/2 top-1/2 h-0.5 -translate-y-1/2 ${
                      isCompleted || isCurrent
                        ? "bg-primary stage-line-fill"
                        : "bg-muted"
                    }`}
                    style={{
                      width: "calc(100% + 1rem)",
                      transform: "translateX(-50%) translateY(-50%)",
                    }}
                  />
                )}
                <div
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-all duration-500 ${
                    isCompleted || isLive
                      ? "bg-primary text-primary-foreground stage-complete"
                      : isCurrent
                        ? "border-2 border-primary bg-primary/15 text-primary stage-active"
                        : "border border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isCompleted || isLive ? (
                    <svg
                      className="h-4 w-4 checkmark-icon"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
              </div>
              <span
                className={`mt-2 text-center text-[10px] leading-tight ${
                  isCurrent
                    ? "font-semibold text-primary"
                    : isCompleted || isLive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {stage.label}
              </span>
              {isCurrent && (
                <span className="mt-0.5 text-[9px] text-muted-foreground">
                  {new Date(updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Estimated time */}
      {status !== "live" && (
        <p className="text-xs text-muted-foreground">
          Estimated delivery: {estimatedDays} business days from spec approval
        </p>
      )}
    </div>
  );
}
