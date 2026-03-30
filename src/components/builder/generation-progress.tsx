"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Analyzing" },
  { label: "Style Guide" },
  { label: "Content" },
  { label: "Structure" },
  { label: "Rendering" },
];

interface GenerationProgressProps {
  step: number;
  total: number;
  statusMessage: string;
}

export function GenerationProgress({
  step,
  statusMessage,
}: GenerationProgressProps) {
  return (
    <div className="builder-progress-bg relative flex h-full min-h-screen w-full flex-col items-center justify-center px-6">
      {/* Animated background gradient */}
      <div className="builder-gradient-orb pointer-events-none absolute inset-0 overflow-hidden">
        <div className="builder-orb-inner absolute" />
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-10">
        {/* Headline */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1
            className="text-2xl font-light tracking-tight"
            style={{ color: "#fafaf9", letterSpacing: "-0.04em" }}
          >
            Building your website...
          </h1>
        </div>

        {/* Step progress track */}
        <div className="w-full">
          <div className="relative flex items-center justify-between">
            {/* Connecting track line */}
            <div
              className="absolute top-[10px] left-0 right-0 h-px"
              style={{ backgroundColor: "#262626" }}
            />
            {/* Filled track */}
            <div
              className="absolute top-[10px] left-0 h-px builder-progress-line"
              style={{
                backgroundColor: "#e85325",
                width:
                  step === 0
                    ? "0%"
                    : `${((step - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />

            {STEPS.map((s, i) => {
              const isDone = i < step;
              const isCurrent = i === step;
              const isPending = i > step;

              return (
                <div
                  key={s.label}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  {/* Dot */}
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-500",
                      isDone && "builder-step-done",
                      isCurrent && "builder-step-current",
                      isPending && "builder-step-pending"
                    )}
                  >
                    {isDone && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        className="shrink-0"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="#e85325"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {isCurrent && (
                      <span
                        className="h-2 w-2 rounded-full builder-current-dot"
                        style={{ backgroundColor: "#e85325" }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-[11px] font-light transition-all duration-300",
                      isDone && "opacity-40",
                      isCurrent && "opacity-100",
                      isPending && "opacity-25"
                    )}
                    style={{
                      color: isCurrent ? "#e85325" : "#a3a3a3",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status message */}
        <p
          className="min-h-[1.5em] text-center text-sm font-light builder-status-message"
          style={{ color: "#a3a3a3", letterSpacing: "-0.01em" }}
        >
          {statusMessage || "\u00a0"}
        </p>
      </div>
    </div>
  );
}
