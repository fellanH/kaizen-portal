"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const PROJECT_TYPES = [
  { value: "new-website", label: "New website" },
  { value: "redesign", label: "Website redesign" },
  { value: "add-features", label: "Add features to existing site" },
];

const TIERS = [
  { value: "starter", label: "Starter", desc: "Clean, fast single-page site" },
  { value: "professional", label: "Professional", desc: "Multi-page with CMS and custom design" },
  { value: "premium", label: "Premium", desc: "Full custom: animations, integrations, priority" },
];

const TIMELINES = [
  { value: "no-rush", label: "No rush" },
  { value: "2-weeks", label: "Within 2 weeks" },
  { value: "1-week", label: "Within 1 week" },
  { value: "urgent", label: "Urgent" },
];

export default function NewProjectPage() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [company, setCompany] = useState(searchParams.get("company") || "");
  const [url, setUrl] = useState("");
  const [type, setType] = useState(searchParams.get("type") || "new-website");
  const [tier, setTier] = useState(searchParams.get("tier") || "starter");
  const [description, setDescription] = useState(searchParams.get("description") || "");
  const [timeline, setTimeline] = useState("no-rush");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim()) return;
    setSubmitting(true);
    try {
      await api.submitProject({
        company: company.trim(),
        url: url.trim() || undefined,
        type,
        tier,
        description: description.trim(),
        timeline,
      });
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit project request");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-6 py-10 sm:px-8 sm:py-14">
        <div className="kaizen-enter-1 flex flex-col items-center py-16 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
          </div>
          <h1
            className="text-xl font-light tracking-tight text-foreground"
            style={{ letterSpacing: "-0.02em" }}
          >
            Request received
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-[1.7] text-muted-foreground">
            We&apos;ve received your project request. You&apos;ll see it appear in your projects within 24 hours.
          </p>
          <Link
            href="/projects"
            className="group mt-8 inline-flex items-center gap-2 text-sm text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-primary" />
            <span className="relative">
              Back to projects
              <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary/40" />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10 sm:px-8 sm:py-14">
      {/* Header */}
      <div className="kaizen-enter-1 space-y-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/projects" className="transition-colors duration-200 hover:text-foreground">
            Projects
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground">New Project</span>
        </nav>
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60"
            style={{ letterSpacing: "0.08em" }}
          >
            Request
          </p>
          <h1
            className="mt-1 text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            New Project
          </h1>
        </div>
        <div className="kaizen-line h-px bg-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="kaizen-enter-2 mt-10 space-y-8">
        {/* Company name */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="company">
            Company name <span className="text-primary">*</span>
          </label>
          <input
            id="company"
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your company name"
            className="w-full border-0 border-b border-border/60 bg-transparent px-0 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
            style={{ fontFamily: "var(--font-aspekta)" }}
          />
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="url">
            Current website URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Leave blank if you don't have one yet"
            className="w-full border-0 border-b border-border/60 bg-transparent px-0 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
            style={{ fontFamily: "var(--font-aspekta)" }}
          />
        </div>

        {/* Project type */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground">Project type</label>
          <div className="space-y-2">
            {PROJECT_TYPES.map((pt) => (
              <label
                key={pt.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all duration-200 ${
                  type === pt.value
                    ? "border-primary/40 bg-primary/[0.04] text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={pt.value}
                  checked={type === pt.value}
                  onChange={(e) => setType(e.target.value)}
                  className="sr-only"
                />
                <span className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  type === pt.value ? "bg-primary" : "bg-muted-foreground/30"
                }`} />
                {pt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Tier */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground">Tier preference</label>
          <div className="space-y-2">
            {TIERS.map((t) => (
              <label
                key={t.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200 ${
                  tier === t.value
                    ? "border-primary/40 bg-primary/[0.04]"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={t.value}
                  checked={tier === t.value}
                  onChange={(e) => setTier(e.target.value)}
                  className="sr-only"
                />
                <span className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-200 ${
                  tier === t.value ? "bg-primary" : "bg-muted-foreground/30"
                }`} />
                <div>
                  <span className={`text-sm ${tier === t.value ? "text-foreground" : "text-muted-foreground"}`}>
                    {t.label}
                  </span>
                  <p className="text-xs text-muted-foreground/60">{t.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="description">
            Tell us about your business and what you need
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your business do? What are you looking for in a website?"
            className="w-full resize-none border-0 border-b border-border/60 bg-transparent px-0 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
            style={{ fontFamily: "var(--font-aspekta)" }}
          />
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground">Timeline</label>
          <div className="flex flex-wrap gap-2">
            {TIMELINES.map((tl) => (
              <button
                key={tl.value}
                type="button"
                onClick={() => setTimeline(tl.value)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                  timeline === tl.value
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {tl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-border/50 pt-6">
          <button
            type="submit"
            disabled={submitting || !company.trim()}
            className="group inline-flex items-center gap-2 text-sm text-foreground transition-all duration-200 disabled:opacity-30"
          >
            <span className="relative">
              {submitting ? "Submitting..." : "Submit Request"}
              <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary" />
            </span>
            <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
