"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ── Types ── */
type Tier = "starter" | "pro" | "agency";

interface Subscription {
  tier: Tier | null;
  status: string | null;
  subscriptionId: string | null;
}

/* ── Plan definitions ── */
const PLANS: {
  tier: Tier;
  label: string;
  price: number;
  recommended?: boolean;
  features: string[];
}[] = [
  {
    tier: "starter",
    label: "Starter",
    price: 49,
    features: [
      "1 site",
      "5 pages",
      "Kaizen subdomain",
      "10 iterations / month",
    ],
  },
  {
    tier: "pro",
    label: "Pro",
    price: 149,
    recommended: true,
    features: [
      "3 sites",
      "Unlimited pages",
      "Custom domain",
      "Unlimited iterations",
    ],
  },
  {
    tier: "agency",
    label: "Agency",
    price: 499,
    features: [
      "10 sites",
      "White-label",
      "API access",
      "Bulk generation",
    ],
  },
];

const TIER_ORDER: Record<Tier, number> = { starter: 0, pro: 1, agency: 2 };

/* ── Checkmark icon ── */
function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mt-0.5 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-muted-foreground/60"
        }`}
      />
      {status}
    </span>
  );
}

/* ── Plan Card ── */
function PlanCard({
  plan,
  currentTier,
  onSelect,
  loading,
}: {
  plan: (typeof PLANS)[number];
  currentTier: Tier | null;
  onSelect: (tier: Tier) => void;
  loading: boolean;
}) {
  const isCurrent = currentTier === plan.tier;
  const hasActivePlan = currentTier !== null;
  const isUpgrade =
    hasActivePlan && !isCurrent && TIER_ORDER[plan.tier] > TIER_ORDER[currentTier!];
  const isDowngrade =
    hasActivePlan && !isCurrent && TIER_ORDER[plan.tier] < TIER_ORDER[currentTier!];

  let ctaLabel = "Get Started";
  if (isCurrent) ctaLabel = "Current Plan";
  else if (isUpgrade) ctaLabel = "Upgrade";
  else if (isDowngrade) ctaLabel = "Downgrade";

  return (
    <div
      className={`relative flex flex-col rounded-xl border p-6 transition-all duration-200 ${
        plan.recommended
          ? "border-[#e85325]/60 bg-[#e85325]/[0.03] shadow-sm"
          : "border-border/60 bg-card"
      } ${isCurrent ? "ring-1 ring-[#e85325]/30" : ""}`}
    >
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className="rounded-full px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.08em]"
            style={{ background: "#e85325", color: "#fff" }}
          >
            Recommended
          </span>
        </div>
      )}

      <div className="mb-5">
        <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
          {plan.label}
        </p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[2rem] font-light tracking-[-0.03em] leading-none">
            {plan.price}
          </span>
          <span className="text-sm text-muted-foreground">EUR /mo</span>
        </div>
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-[#e85325]">
              <Check />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isCurrent && onSelect(plan.tier)}
        disabled={isCurrent || loading}
        className={`w-full rounded-lg px-4 py-2.5 text-sm font-light transition-all duration-200 ${
          isCurrent
            ? "cursor-default border border-border/40 text-muted-foreground/50"
            : plan.recommended
              ? "bg-[#e85325] text-white hover:bg-[#c94520] active:scale-[0.98] disabled:opacity-50"
              : "border border-border/60 text-foreground hover:border-[#e85325]/60 hover:text-[#e85325] active:scale-[0.98] disabled:opacity-50"
        }`}
      >
        {loading && !isCurrent ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-3.5 w-3.5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Processing...
          </span>
        ) : (
          ctaLabel
        )}
      </button>
    </div>
  );
}

/* ── Main Page ── */
export default function BillingPage() {
  const { email } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [selectingTier, setSelectingTier] = useState<Tier | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const userId = email ?? "";

  const fetchSubscription = useCallback(async () => {
    if (!userId) return;
    setLoadingSubscription(true);
    try {
      const data = await api.getSubscription(userId);
      setSubscription({
        tier: (data.tier as Tier) ?? null,
        status: data.status ?? null,
        subscriptionId: data.subscriptionId ?? null,
      });
    } catch {
      setSubscription({ tier: null, status: null, subscriptionId: null });
    } finally {
      setLoadingSubscription(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleSelectTier = async (tier: Tier) => {
    if (!userId) return;
    setSelectingTier(tier);
    try {
      const { url } = await api.createSubscription(tier, userId);
      window.location.href = url;
    } catch {
      toast.error("Failed to start checkout. Please try again.");
      setSelectingTier(null);
    }
  };

  const handleCancel = async () => {
    if (!subscription?.subscriptionId) return;
    setCancelling(true);
    try {
      await api.cancelSubscription(subscription.subscriptionId);
      toast.success("Subscription cancelled");
      setCancelOpen(false);
      await fetchSubscription();
    } catch {
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const currentPlan = subscription?.tier
    ? PLANS.find((p) => p.tier === subscription.tier)
    : null;

  const hasActivePlan =
    subscription?.tier !== null && subscription?.status === "active";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-14">
      {/* Page header */}
      <div className="kaizen-enter-1 space-y-4">
        <div>
          <p
            className="text-[0.6rem] font-medium uppercase text-muted-foreground/60"
            style={{ letterSpacing: "0.08em" }}
          >
            Settings
          </p>
          <h1
            className="mt-1 text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            Plan &amp; Billing
          </h1>
        </div>
        <div className="kaizen-line h-px bg-border" />
      </div>

      {/* Current plan */}
      <div className="kaizen-enter-2 mt-10">
        <div className="ds-rule mb-6" />
        <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
          Current Plan
        </p>

        {loadingSubscription ? (
          <div className="mt-4 flex items-center gap-4">
            <div className="h-5 w-24 ds-skeleton rounded" />
            <div className="h-5 w-16 ds-skeleton rounded-full" />
          </div>
        ) : hasActivePlan && currentPlan ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-lg font-light tracking-[-0.02em]">
              {currentPlan.label}
            </span>
            <span className="text-sm text-muted-foreground">
              EUR {currentPlan.price}/mo
            </span>
            {subscription?.status && (
              <StatusBadge status={subscription.status} />
            )}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">No active plan</span>
            <span className="text-xs text-[#e85325]">Choose a plan below to get started</span>
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div className="kaizen-enter-3 mt-10">
        <div className="ds-rule mb-6" />
        <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
          Plans
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.tier}
              plan={plan}
              currentTier={subscription?.tier ?? null}
              onSelect={handleSelectTier}
              loading={selectingTier === plan.tier}
            />
          ))}
        </div>
      </div>

      {/* Cancel subscription */}
      {hasActivePlan && subscription?.subscriptionId && (
        <div className="kaizen-enter-4 mt-12 border-t border-border/40 pt-8">
          <button
            onClick={() => setCancelOpen(true)}
            className="group inline-flex items-center text-xs text-muted-foreground/60 transition-colors duration-200 hover:text-foreground"
          >
            <span className="relative">
              Cancel subscription
              <span className="absolute inset-x-0 -bottom-px h-px bg-muted-foreground/30 transition-colors duration-200 group-hover:bg-destructive/60" />
            </span>
          </button>
        </div>
      )}

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light tracking-[-0.02em]">
              Cancel subscription
            </DialogTitle>
            <DialogDescription>
              Your plan will remain active until the end of the current billing
              period. After that, access to premium features will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <button
              onClick={() => setCancelOpen(false)}
              disabled={cancelling}
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground disabled:opacity-50"
            >
              Keep plan
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive transition-colors duration-200 hover:bg-destructive/20 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Yes, cancel"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
