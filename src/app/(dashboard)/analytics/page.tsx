"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart3, Eye, Users, Clock, ArrowDown } from "lucide-react";
import { api, type AnalyticsSummary } from "@/lib/api";
import { useProjects } from "@/lib/projects-context";

type Period = "7d" | "30d" | "all";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All time" },
];

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

/* ── Summary card ── */
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/20">
      <div className="flex items-center gap-2 text-muted-foreground/60">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>
      <p
        className="mt-2 text-2xl font-light tracking-tight text-foreground"
        style={{ letterSpacing: "-0.03em" }}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs text-muted-foreground/50">{sub}</p>
      )}
    </div>
  );
}

/* ── CSS-only bar chart ── */
function DailyViewsChart({ data }: { data: AnalyticsSummary["daily_views"] }) {
  const max = Math.max(...data.map((d) => d.views), 1);
  // Show last 14 bars max for readability when period is 30d or all
  const visible = data.length > 21 ? data.slice(-21) : data;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground/60">
        <BarChart3 className="h-3.5 w-3.5" />
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.08em]">
          Daily Page Views
        </span>
      </div>
      <div className="flex items-end gap-[3px]" style={{ height: 160 }}>
        {visible.map((d) => {
          const pct = (d.views / max) * 100;
          return (
            <div
              key={d.date}
              className="group relative flex-1 cursor-default"
              style={{ height: "100%" }}
            >
              <div
                className="absolute bottom-0 w-full rounded-sm bg-primary/70 transition-colors duration-150 group-hover:bg-primary"
                style={{ height: `${pct}%`, minHeight: 2 }}
              />
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[0.6rem] text-background shadow-md group-hover:block whitespace-nowrap">
                {d.date}: {d.views}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[0.55rem] text-muted-foreground/40">
        <span>{visible[0]?.date}</span>
        <span>{visible[visible.length - 1]?.date}</span>
      </div>
    </div>
  );
}

/* ── Scroll depth funnel ── */
function ScrollFunnel({
  data,
  totalViews,
}: {
  data: AnalyticsSummary["scroll_depth"];
  totalViews: number;
}) {
  const sorted = [...data].sort((a, b) => a.depth - b.depth);
  const maxCount = sorted[0]?.count || 1;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground/60">
        <ArrowDown className="h-3.5 w-3.5" />
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.08em]">
          Scroll Depth Funnel
        </span>
      </div>
      <div className="space-y-3">
        {sorted.map((level) => {
          const pct = (level.count / maxCount) * 100;
          const rate = totalViews > 0 ? ((level.count / totalViews) * 100).toFixed(0) : "0";
          return (
            <div key={level.depth}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-medium text-foreground/80">
                  {level.depth}%
                </span>
                <span className="text-[0.6rem] text-muted-foreground/50">
                  {level.count.toLocaleString()} ({rate}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      level.depth <= 25
                        ? "#22c55e"
                        : level.depth <= 50
                          ? "#3b82f6"
                          : level.depth <= 75
                            ? "#eab308"
                            : "#e85325",
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Top pages table ── */
function TopPagesTable({ pages }: { pages: AnalyticsSummary["top_pages"] }) {
  const max = pages[0]?.views || 1;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground/60">
        <Eye className="h-3.5 w-3.5" />
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.08em]">
          Top Pages
        </span>
      </div>
      <div className="space-y-2">
        {pages.map((page) => (
          <div key={page.url} className="flex items-center gap-3">
            <span className="min-w-0 flex-1 truncate text-sm font-light text-foreground/80">
              {page.url}
            </span>
            <div className="hidden sm:block w-24">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/50"
                  style={{ width: `${(page.views / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {page.views.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Top clicks table ── */
function TopClicksTable({
  clicks,
}: {
  clicks: AnalyticsSummary["top_clicks"];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground/60">
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.08em]">
          Top Clicks
        </span>
      </div>
      <div className="space-y-2">
        {clicks.map((click, i) => (
          <div
            key={`${click.target}-${i}`}
            className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-light text-foreground/80">
                {click.text}
              </p>
              <p className="truncate text-[0.6rem] text-muted-foreground/40">
                {click.target}
              </p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {click.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Empty state ── */
function AnalyticsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <BarChart3 className="h-7 w-7 text-muted-foreground/40" />
      </div>
      <p className="text-base text-foreground/80">No analytics yet</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Analytics will appear once your site starts receiving visitors.
      </p>
    </div>
  );
}

/* ── Loading skeleton ── */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card p-5">
            <div className="h-3 w-20 rounded skeleton-shimmer" />
            <div className="mt-4 h-7 w-16 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
      <div className="h-52 rounded-xl border border-border bg-card skeleton-shimmer" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-48 rounded-xl border border-border bg-card skeleton-shimmer" />
        <div className="h-48 rounded-xl border border-border bg-card skeleton-shimmer" />
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const { projects, loading: projectsLoading } = useProjects();
  const [period, setPeriod] = useState<Period>("7d");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  // Default to query param project, or first project
  useEffect(() => {
    if (projects.length > 0 && !selectedToken) {
      const paramToken = searchParams.get("project");
      const match = paramToken && projects.find((p) => p.token === paramToken);
      setSelectedToken(match ? match.token : projects[0].token);
    }
  }, [projects, selectedToken, searchParams]);

  const fetchData = useCallback(async () => {
    if (!selectedToken) return;
    setLoading(true);
    try {
      const result = await api.getAnalytics(selectedToken, period);
      setData(result);
      setIsEmpty(result.page_views === 0);
    } catch {
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  }, [selectedToken, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const scrollCompletionRate =
    data && data.page_views > 0
      ? (
          ((data.scroll_depth.find((d) => d.depth === 100)?.count || 0) /
            data.page_views) *
          100
        ).toFixed(0)
      : "0";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-14">
      {/* Header */}
      <div className="kaizen-enter-1 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60"
              style={{ letterSpacing: "0.08em" }}
            >
              Performance
            </p>
            <h1
              className="mt-1 text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
              style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
            >
              Analytics
            </h1>
          </div>
        </div>
        <div className="kaizen-line h-px bg-border" />
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* Project selector */}
        {projects.length > 1 && (
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-light text-foreground outline-none transition-colors duration-150 focus:border-primary/40"
          >
            {projects.map((p) => (
              <option key={p.token} value={p.token}>
                {p.company_name}
              </option>
            ))}
          </select>
        )}

        {/* Period pills */}
        <div className="flex rounded-lg border border-border bg-card p-0.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 ${
                period === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        {projectsLoading || loading ? (
          <AnalyticsSkeleton />
        ) : projects.length === 0 || isEmpty ? (
          <AnalyticsEmptyState />
        ) : data ? (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Eye}
                label="Page Views"
                value={data.page_views.toLocaleString()}
                sub={`${data.period.start} to ${data.period.end}`}
              />
              <StatCard
                icon={Users}
                label="Unique Visitors"
                value={data.unique_visitors.toLocaleString()}
              />
              <StatCard
                icon={Clock}
                label="Avg. Session"
                value={formatDuration(data.avg_session_duration_ms)}
              />
              <StatCard
                icon={ArrowDown}
                label="Scroll Completion"
                value={`${scrollCompletionRate}%`}
                sub="Reached bottom of page"
              />
            </div>

            {/* Daily views chart */}
            <DailyViewsChart data={data.daily_views} />

            {/* Two-column grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TopPagesTable pages={data.top_pages} />
              <ScrollFunnel data={data.scroll_depth} totalViews={data.page_views} />
            </div>

            {/* Top clicks */}
            <TopClicksTable clicks={data.top_clicks} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
