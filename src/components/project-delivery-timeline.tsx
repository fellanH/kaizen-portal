"use client";

const STAGES = [
  { key: "intake_received", label: "Intake", color: "muted" },
  { key: "spec_writing", label: "Spec", color: "amber" },
  { key: "building", label: "Build", color: "blue" },
  { key: "review_ready", label: "Review", color: "orange" },
  { key: "live", label: "Delivery", color: "emerald" },
];

function stageIndex(status: string) {
  const idx = STAGES.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function ProjectDeliveryTimeline({
  status,
  createdAt,
  tier,
}: {
  status: string;
  createdAt: string;
  tier: string;
}) {
  const tierDays: Record<string, number> = {
    starter: 3,
    professional: 5,
    premium: 10,
  };
  const totalDays = tierDays[tier] || 5;

  const startDate = new Date(createdAt);
  const today = new Date();
  const deliveryDate = addBusinessDays(startDate, totalDays);

  const currentStage = stageIndex(status);
  const totalSpan = daysBetween(startDate, deliveryDate);
  const elapsed = daysBetween(startDate, today);
  const todayPercent = Math.min(Math.max((elapsed / totalSpan) * 100, 0), 100);

  const isOverdue = today > deliveryDate && status !== "live";
  const isDelivered = status === "live";

  const milestones = STAGES.map((stage, i) => ({
    ...stage,
    position: (i / (STAGES.length - 1)) * 100,
    reached: i <= currentStage,
    active: i === currentStage,
  }));

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Started {formatDate(startDate)}
        </span>
        {isDelivered ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Delivered
          </span>
        ) : isOverdue ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-amber-500">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Adjusted: {formatDate(addBusinessDays(today, 2))}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Est. delivery: {formatDate(deliveryDate)}
          </span>
        )}
      </div>

      {/* Timeline bar */}
      <div className="relative pb-8 pt-4">
        {/* Track */}
        <div className="h-1 w-full rounded-full bg-muted" />

        {/* Filled portion: use emerald for delivered, primary otherwise */}
        <div
          className={`timeline-fill absolute top-4 left-0 h-1 rounded-full ${
            isDelivered ? "bg-emerald-500" : "bg-primary"
          }`}
          style={{
            width: isDelivered
              ? "100%"
              : `${Math.min(todayPercent, milestones[currentStage].position + 5)}%`,
          }}
        />

        {/* Today marker */}
        {!isDelivered && (
          <div
            className="absolute top-2 today-marker"
            style={{ left: `${todayPercent}%` }}
          >
            <div className="h-5 w-0.5 rounded-full bg-foreground" />
            <span className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-foreground">
              Today
            </span>
          </div>
        )}

        {/* Milestone dots */}
        {milestones.map((m) => (
          <div
            key={m.key}
            className="absolute top-4 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${m.position}%` }}
          >
            <div
              className={`h-3 w-3 rounded-full border-2 transition-colors duration-500 ${
                m.reached
                  ? m.key === "live"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-primary bg-primary"
                  : "border-muted-foreground/30 bg-background"
              } ${m.active ? "milestone-pulse" : ""}`}
            />
            <span
              className={`absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] ${
                m.active
                  ? "font-semibold text-primary"
                  : m.reached
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Business days info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>
          {tier.charAt(0).toUpperCase() + tier.slice(1)} tier · {totalDays}{" "}
          business days
        </span>
        {isOverdue && !isDelivered && (
          <span className="rounded-full status-amber px-2 py-0.5 text-[10px] font-medium">
            Adjusted
          </span>
        )}
      </div>
    </div>
  );
}
