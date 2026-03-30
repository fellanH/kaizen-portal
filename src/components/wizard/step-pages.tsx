"use client";

import { WizardData, ALL_PAGES, INDUSTRY_PAGE_PRESETS } from "./types";

interface StepPagesProps {
  data: WizardData;
  onChange: (data: WizardData) => void;
}

export function StepPages({ data, onChange }: StepPagesProps) {
  const preset = data.company.industry
    ? INDUSTRY_PAGE_PRESETS[data.company.industry] ?? ["home"]
    : [];

  function togglePage(slug: string) {
    if (slug === "home") return; // always checked
    const current = data.pages;
    const updated = current.includes(slug)
      ? current.filter((p) => p !== slug)
      : [...current, slug];
    // Always keep home
    if (!updated.includes("home")) updated.unshift("home");
    onChange({ ...data, pages: updated });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Step 3 of 5</p>
        <h2
          className="mt-1 text-xl font-light text-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Which pages do you need?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground/70">
          We have pre-selected pages common for{" "}
          {data.company.industry
            ? data.company.industry.replace(/-/g, " ")
            : "your industry"}
          . Adjust to fit your needs.
        </p>
      </div>

      {preset.length > 0 && (
        <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
          <p className="text-[11px] text-muted-foreground/60">
            Pre-selected based on your industry. Home is always included.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ALL_PAGES.map((page) => {
          const checked = data.pages.includes(page.value);
          const locked = page.alwaysChecked;
          const isPreset = preset.includes(page.value);

          return (
            <button
              key={page.value}
              type="button"
              onClick={() => togglePage(page.value)}
              disabled={locked}
              className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200 ${
                checked
                  ? "border-primary/40 bg-primary/[0.04]"
                  : "border-border/50 hover:border-border bg-transparent"
              } ${locked ? "cursor-default" : "cursor-pointer"}`}
            >
              {/* Checkbox */}
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                  checked
                    ? "border-primary bg-primary"
                    : "border-border/60 bg-transparent"
                }`}
              >
                {checked && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path
                      d="M1.5 4L3.5 6L6.5 2"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <span
                  className={`text-sm font-medium ${
                    checked ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {page.label}
                </span>
                {locked && (
                  <span className="ml-2 text-[10px] text-muted-foreground/40">Always included</span>
                )}
                {!locked && isPreset && !checked && (
                  <span className="ml-2 text-[10px] text-primary/50">Recommended</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground/50">
        {data.pages.length} page{data.pages.length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
}
