"use client";

import { useState } from "react";
import { WizardData, ALL_PAGES } from "./types";

interface StepContentProps {
  data: WizardData;
  onChange: (data: WizardData) => void;
}

// Pages we ask for per-page messaging (always home, plus up to 3 more selected)
function getPriorityPages(selectedPages: string[]): string[] {
  const priority = ["home", "services", "about", "portfolio", "pricing"];
  const result = ["home"];
  for (const p of priority) {
    if (p !== "home" && selectedPages.includes(p)) {
      result.push(p);
      if (result.length >= 4) break;
    }
  }
  return result;
}

function getPageLabel(slug: string): string {
  return ALL_PAGES.find((p) => p.value === slug)?.label ?? slug;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors duration-200"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M3 5L7 9L11 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="border-t border-border/40 px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function StepContent({ data, onChange }: StepContentProps) {
  const priorityPages = getPriorityPages(data.pages);

  function updateMessage(slug: string, value: string) {
    onChange({
      ...data,
      content: {
        ...data.content,
        messages: { ...data.content.messages, [slug]: value },
      },
    });
  }

  function updateField(
    field: "differentiators" | "primaryCta" | "secondaryCta",
    value: string
  ) {
    onChange({ ...data, content: { ...data.content, [field]: value } });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Step 4 of 5</p>
        <h2
          className="mt-1 text-xl font-light text-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Content brief
        </h2>
        <p className="mt-1 text-sm text-muted-foreground/70">
          A few sentences per page is all we need. Our system turns this into
          polished copy.
        </p>
      </div>

      {/* Per-page messaging */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50" style={{ letterSpacing: "0.08em" }}>
          Page messages
        </p>
        <div className="space-y-2">
          {priorityPages.map((slug, i) => (
            <CollapsibleSection
              key={slug}
              title={getPageLabel(slug)}
              defaultOpen={i === 0}
            >
              <div className="space-y-1.5">
                <label className="block text-[11px] text-muted-foreground/60">
                  What should this page communicate?
                </label>
                <textarea
                  value={data.content.messages[slug] ?? ""}
                  onChange={(e) => updateMessage(slug, e.target.value)}
                  placeholder={
                    slug === "home"
                      ? "Our hero proposition, what we do and who we help..."
                      : slug === "services"
                      ? "The services we offer and what clients can expect..."
                      : slug === "about"
                      ? "Our story, values, and what sets us apart..."
                      : "Key message for this page..."
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-muted/50"
                />
              </div>
            </CollapsibleSection>
          ))}
        </div>
      </div>

      {/* Global fields */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50" style={{ letterSpacing: "0.08em" }}>
          Brand positioning
        </p>
        <div className="space-y-5 rounded-xl border border-border/50 p-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">
              What makes you different? <span className="text-primary">*</span>
            </label>
            <textarea
              value={data.content.differentiators}
              onChange={(e) => updateField("differentiators", e.target.value)}
              placeholder="We are the only firm in Stockholm that combines X with Y. Our clients stay with us because..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-muted/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">
              Primary call-to-action <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={data.content.primaryCta}
              onChange={(e) => updateField("primaryCta", e.target.value)}
              placeholder="Book a free consultation"
              className="w-full rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-muted/50"
            />
            <p className="text-[11px] text-muted-foreground/50">
              The main action you want visitors to take.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground/80">
              Secondary call-to-action{" "}
              <span className="text-muted-foreground/50 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={data.content.secondaryCta ?? ""}
              onChange={(e) => updateField("secondaryCta", e.target.value)}
              placeholder="View our work"
              className="w-full rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-muted/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
