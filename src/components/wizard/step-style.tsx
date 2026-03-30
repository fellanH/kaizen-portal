"use client";

import { WizardData, MOODS, MoodKey } from "./types";

interface StepStyleProps {
  data: WizardData;
  onChange: (data: WizardData) => void;
}

export function StepStyle({ data, onChange }: StepStyleProps) {
  function selectMood(mood: MoodKey) {
    onChange({ ...data, style: { ...data.style, mood } });
  }

  function updateReferences(value: string) {
    const refs = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({ ...data, style: { ...data.style, references: refs } });
  }

  const referencesValue = (data.style.references ?? []).join(", ");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Step 2 of 5</p>
        <h2
          className="mt-1 text-xl font-light text-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Choose your visual direction
        </h2>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Pick the mood that best reflects how you want your brand to feel.
        </p>
      </div>

      {/* Mood cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOODS.map((mood) => {
          const selected = data.style.mood === mood.key;
          return (
            <button
              key={mood.key}
              type="button"
              onClick={() => selectMood(mood.key)}
              className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all duration-300 ${
                selected
                  ? "border-primary/50 ring-1 ring-primary/20"
                  : "border-border/60 hover:border-border"
              }`}
            >
              {/* Visual preview */}
              <div
                className="h-28 w-full transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ background: mood.gradient }}
              >
                {/* Decorative shapes */}
                <div className="relative h-full w-full overflow-hidden">
                  <div
                    className="absolute bottom-3 left-4 h-1.5 w-16 rounded-full opacity-60"
                    style={{ background: mood.accent }}
                  />
                  <div
                    className="absolute bottom-7 left-4 h-1 w-10 rounded-full opacity-40"
                    style={{ background: mood.accent }}
                  />
                  <div
                    className="absolute right-4 top-4 h-8 w-8 rounded-full opacity-20"
                    style={{ background: mood.accent }}
                  />
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-1 bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{mood.label}</span>
                  {selected && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1.5 4L3.5 6L6.5 2"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/70">{mood.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reference sites */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-foreground/80">
          Reference sites{" "}
          <span className="text-muted-foreground/50 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={referencesValue}
          onChange={(e) => updateReferences(e.target.value)}
          placeholder="https://stripe.com, https://linear.app"
          className="w-full rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-muted/50"
        />
        <p className="text-[11px] text-muted-foreground/50">
          Comma-separated URLs of sites you admire. We will study their design patterns.
        </p>
      </div>
    </div>
  );
}
