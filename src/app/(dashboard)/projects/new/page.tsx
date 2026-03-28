"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ArrowLeft, ArrowRight, CheckCircle2, Check } from "lucide-react";

const STRIPE_LINKS: Record<string, string> = {
  starter: "https://buy.stripe.com/7sY5kF0nDbOmdv061R8N201",
  professional: "https://buy.stripe.com/fZu3cxb2h9Ge8aG4XN8N202",
  premium: "https://buy.stripe.com/8x228t5HX2dM9eK4XN8N203",
};

const TIERS = [
  {
    value: "starter",
    label: "Starter",
    price: "19 000",
    timeline: "3\u20135 days",
    features: [
      "5 pages",
      "5 blog articles",
      "Basic SEO",
      "CMS",
    ],
  },
  {
    value: "professional",
    label: "Professional",
    price: "32 000",
    timeline: "5\u20137 days",
    recommended: true,
    features: [
      "7 pages",
      "10 blog articles",
      "Full SEO",
      "CMS",
      "Brand reference",
      "1 custom section",
    ],
  },
  {
    value: "premium",
    label: "Premium",
    price: "49 000",
    timeline: "7\u201310 days",
    features: [
      "10+ pages",
      "20 blog articles",
      "Full SEO + strategy",
      "CMS",
      "Brand reference",
      "3+ custom sections",
      "30 days priority support",
    ],
  },
];

const PROJECT_TYPES = [
  { value: "new-website", label: "New website" },
  { value: "redesign", label: "Website redesign" },
  { value: "add-features", label: "Add features to existing site" },
];

export default function NewProjectPage() {
  const searchParams = useSearchParams();
  const { email } = useAuth();

  const prefilledCompany = searchParams.get("company") || "";
  const prefilledType = searchParams.get("type") || "";
  const isUpsell = !!prefilledCompany;
  const isAuthenticated = !!email;

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [tier, setTier] = useState(searchParams.get("tier") || "starter");
  const [company, setCompany] = useState(prefilledCompany);
  const [url, setUrl] = useState("");
  const [type, setType] = useState(prefilledType || "new-website");
  const [description, setDescription] = useState(
    searchParams.get("description") || ""
  );

  const selectedTier = TIERS.find((t) => t.value === tier)!;

  async function handlePay() {
    if (!company.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      if (isAuthenticated) {
        // Authenticated: submit project via API, then open Stripe
        const result = await api.submitProject({
          company: company.trim(),
          name: email.split("@")[0],
          email,
          url: url.trim() || undefined,
          type,
          tier,
          description: description.trim(),
          timeline: selectedTier.timeline,
        });
        if (!result.ok) {
          setError("Failed to create project. Please try again.");
          return;
        }
      }
      const stripeUrl = new URL(STRIPE_LINKS[tier]);
      if (email) {
        stripeUrl.searchParams.set("prefilled_email", email);
      }
      stripeUrl.searchParams.set("client_reference_id", company.trim());
      window.open(stripeUrl.toString(), "_blank");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
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
            Complete your payment
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-[1.7] text-muted-foreground">
            Complete your payment in the Stripe tab to start your project. Once
            payment is confirmed, your project will appear in your dashboard.
          </p>
          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {selectedTier.label}
            </span>
            <span className="text-muted-foreground/40">|</span>
            <span>
              <span className="font-medium text-foreground">
                {selectedTier.price}
              </span>{" "}
              <span className="text-[10px]">SEK</span>
            </span>
            <span className="text-muted-foreground/40">|</span>
            <span>{selectedTier.timeline}</span>
          </div>
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
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-14">
      {/* Header */}
      <div className="kaizen-enter-1 space-y-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/projects"
            className="transition-colors duration-200 hover:text-foreground"
          >
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
            {isUpsell ? "New project" : "Get started"}
          </p>
          <h1
            className="mt-1 text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            {isUpsell
              ? `Another project for ${prefilledCompany}`
              : "New Project"}
          </h1>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span
            className={
              step === 1 ? "font-medium text-foreground" : "text-primary"
            }
          >
            1. Choose plan
          </span>
          <span className="text-muted-foreground/30">\u2192</span>
          <span
            className={
              step === 2
                ? "font-medium text-foreground"
                : "text-muted-foreground/50"
            }
          >
            2. Project details
          </span>
        </div>
        <div className="kaizen-line h-px bg-border" />
      </div>

      {/* Step 1: Choose plan */}
      {step === 1 && (
        <div className="kaizen-enter-2 mt-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {TIERS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTier(t.value)}
                className={`group relative flex flex-col rounded-xl border p-6 text-left transition-all duration-300 ${
                  tier === t.value
                    ? "border-primary/50 bg-primary/[0.04]"
                    : "border-border/60 hover:border-border"
                }`}
              >
                {t.recommended && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-white">
                    Recommended
                  </span>
                )}
                <span
                  className={`text-sm font-medium ${
                    tier === t.value
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t.label}
                </span>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span
                    className="text-2xl font-semibold tracking-tight text-foreground"
                    style={{ letterSpacing: "-0.03em" }}
                  >
                    {t.price}
                  </span>
                  <span className="text-xs text-muted-foreground">SEK</span>
                </div>
                <span className="mt-1 text-xs text-muted-foreground/70">
                  {t.timeline} delivery
                </span>
                <div className="mt-5 flex flex-col gap-2">
                  {t.features.map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Check
                        className={`h-3 w-3 shrink-0 ${
                          tier === t.value
                            ? "text-primary"
                            : "text-muted-foreground/40"
                        }`}
                      />
                      {f}
                    </span>
                  ))}
                </div>
                {/* Selection indicator */}
                {tier === t.value && (
                  <div className="absolute right-3 top-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
            All prices exclude 25% VAT (moms). Prices in SEK.
          </p>

          <div className="mt-8 flex justify-end border-t border-border/50 pt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="group inline-flex items-center gap-2 text-sm text-foreground transition-all duration-200"
            >
              <span className="relative">
                Continue
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary" />
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Project details */}
      {step === 2 && (
        <div className="kaizen-enter-2 mx-auto mt-10 max-w-xl">
          {/* Selected tier summary */}
          <div className="mb-8 flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  {selectedTier.label}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {selectedTier.price} SEK
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Change
            </button>
          </div>

          <div className="space-y-8">
            {/* Company name */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="company"
              >
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
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="url"
              >
                Current website URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="We'll use this as a starting point for your redesign"
                className="w-full border-0 border-b border-border/60 bg-transparent px-0 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
                style={{ fontFamily: "var(--font-aspekta)" }}
              />
            </div>

            {/* Project type -- only shown for unauthenticated users */}
            {!isAuthenticated && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground">
                  Project type
                </label>
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
                      <span
                        className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                          type === pt.value
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        }`}
                      />
                      {pt.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Description -- only shown for unauthenticated users */}
            {!isAuthenticated && (
              <div className="space-y-2">
                <label
                  className="text-xs font-medium text-muted-foreground"
                  htmlFor="description"
                >
                  What does your business do? What are you hoping to achieve?
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your business and what you're looking for"
                  className="w-full resize-none border-0 border-b border-border/60 bg-transparent px-0 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
                  style={{ fontFamily: "var(--font-aspekta)" }}
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            {/* Pay button */}
            <div className="border-t border-border/50 pt-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={submitting || !company.trim()}
                  className="inline-flex items-center gap-3 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary/90 disabled:opacity-30"
                >
                  {submitting ? (
                    "Processing..."
                  ) : (
                    <>
                      Pay &amp; Start Project
                      <span className="text-xs opacity-80">
                        {selectedTier.price} SEK
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
