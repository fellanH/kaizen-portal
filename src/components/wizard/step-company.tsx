"use client";

import { WizardData, INDUSTRIES } from "./types";

interface StepCompanyProps {
  data: WizardData;
  onChange: (data: WizardData) => void;
}

export function StepCompany({ data, onChange }: StepCompanyProps) {
  function update(field: keyof WizardData["company"], value: string) {
    onChange({
      ...data,
      company: { ...data.company, [field]: value },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Step 1 of 5</p>
        <h2 className="mt-1 text-xl font-light text-foreground" style={{ letterSpacing: "-0.02em" }}>
          Tell us about your company
        </h2>
        <p className="mt-1 text-sm text-muted-foreground/70">
          This helps us tailor every aspect of your site to your business.
        </p>
      </div>

      <div className="space-y-5">
        {/* Company name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            Company name <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            value={data.company.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Acme AB"
            className="w-full rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-muted/50"
          />
        </div>

        {/* Website URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            Current website{" "}
            <span className="text-muted-foreground/50 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={data.company.url ?? ""}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-muted/50"
          />
          <p className="text-[11px] text-muted-foreground/50">
            We will use this to understand your current brand.
          </p>
        </div>

        {/* Industry */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            Industry <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <select
              value={data.company.industry}
              onChange={(e) => update("industry", e.target.value)}
              className="w-full appearance-none rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-muted/50 cursor-pointer"
            >
              <option value="" disabled className="text-muted-foreground">
                Select your industry
              </option>
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-foreground/80">
            What does your business do? <span className="text-primary">*</span>
          </label>
          <textarea
            value={data.company.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Write 2-3 sentences describing your business, who you serve, and what you offer."
            rows={4}
            className="w-full resize-none rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-200 focus:border-primary/50 focus:bg-muted/50"
          />
          <p className="text-[11px] text-muted-foreground/50">
            {data.company.description.length} / 500 characters
          </p>
        </div>
      </div>
    </div>
  );
}
