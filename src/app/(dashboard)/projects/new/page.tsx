"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

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

export default function NewProjectPage() {
  const searchParams = useSearchParams();
  const { email } = useAuth();

  const [tier, setTier] = useState(searchParams.get("tier") || "professional");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedTier = TIERS.find((t) => t.value === tier)!;

  const PAYMENT_LINKS: Record<string, string> = {
    starter: "https://buy.stripe.com/test_7sYfZjfix3hQfD889Z8N200",
    professional: "https://buy.stripe.com/test_7sY5kF0nDbOmdv061R8N201",
    premium: "https://buy.stripe.com/test_fZu3cxb2h9Ge8aG4XN8N202",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const company = email.split("@")[0];
    setSubmitting(true);
    setError("");
    try {
      const result = await api.submitProject({
        company,
        email,
        tier,
      });
      const token = result.token;
      const paymentUrl = PAYMENT_LINKS[tier];
      if (!paymentUrl || !token) {
        throw new Error("Missing payment link or token");
      }
      const redirectUrl = `${paymentUrl}?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${encodeURIComponent(token)}`;
      window.location.href = redirectUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";

      // Session expired (API client throws "Unauthorized" on 401)
      if (msg === "Unauthorized") {
        localStorage.removeItem("kaizen_token");
        window.location.href = "/login";
        return;
      }

      // Validation error (422)
      if (msg.startsWith("API error 422")) {
        const body = msg.replace(/^API error 422:\s*/, "");
        try {
          const parsed = JSON.parse(body);
          setError(parsed?.error || "Please check your input and try again.");
        } catch {
          setError("Please check your input and try again.");
        }
        setSubmitting(false);
        return;
      }

      // Network error
      if (err instanceof TypeError && msg.includes("fetch")) {
        setError("Connection lost. Check your internet and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
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
            Get started
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

      <form onSubmit={handleSubmit} className="mt-10 space-y-10">
        {/* Tier selector */}
        <div className="kaizen-enter-2">
          <p className="mb-4 text-xs font-medium text-muted-foreground">
            Choose your plan
          </p>
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
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-xs text-red-500">{error}</p>
        )}

        {/* Submit */}
        <div className="border-t border-border/50 pt-6">
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-3 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary/90 disabled:opacity-30"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                <>
                  Continue to Payment
                  <span className="text-xs opacity-80">
                    {selectedTier.price} SEK
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
