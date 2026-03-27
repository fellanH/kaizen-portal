"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Users, Clock, ArrowDown, BarChart3 } from "lucide-react";
import { api, type AnalyticsSummary } from "@/lib/api";

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
      <span className="text-lg font-light tracking-tight text-foreground" style={{ letterSpacing: "-0.03em" }}>
        {value}
      </span>
      <span className="text-[0.55rem] font-medium uppercase tracking-[0.06em] text-muted-foreground/50">
        {label}
      </span>
    </div>
  );
}

export function ProjectAnalyticsSummary({ token }: { token: string }) {
  const [data, setData] = useState<AnalyticsSummary | null | undefined>(undefined);

  useEffect(() => {
    api.getProjectAnalytics(token, 7).then(setData);
  }, [token]);

  // Loading state
  if (data === undefined) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-muted-foreground/60 mb-4">
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.08em]">Analytics</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-3.5 w-3.5 rounded skeleton-shimmer" />
              <div className="h-5 w-10 rounded skeleton-shimmer" />
              <div className="h-2 w-14 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No data state
  if (data === null) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-muted-foreground/60 mb-3">
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.08em]">Analytics</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Analytics will appear once your site starts receiving visitors.
        </p>
      </div>
    );
  }

  const avgDepth = data.scroll_depth.length > 0
    ? Math.round(data.scroll_depth.reduce((sum, d) => sum + d.depth * d.count, 0) / Math.max(data.scroll_depth.reduce((sum, d) => sum + d.count, 0), 1))
    : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground/60 mb-4">
        <BarChart3 className="h-3.5 w-3.5" />
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.08em]">Analytics</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Metric icon={Eye} label="Page Views" value={data.page_views.toLocaleString()} />
        <Metric icon={Users} label="Visitors" value={data.unique_visitors.toLocaleString()} />
        <Metric icon={Clock} label="Avg Duration" value={formatDuration(data.avg_session_duration_ms)} />
        <div className="flex flex-col items-center gap-1 text-center">
          <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="text-lg font-light tracking-tight text-foreground" style={{ letterSpacing: "-0.03em" }}>
            {avgDepth}%
          </span>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-10 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${avgDepth}%` }}
              />
            </div>
            <span className="text-[0.55rem] font-medium uppercase tracking-[0.06em] text-muted-foreground/50">
              Scroll
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-[0.6rem] text-muted-foreground/40">Last 7 days</span>
        <Link
          href={`/analytics?project=${token}`}
          className="text-xs text-primary transition-colors duration-200 hover:text-primary/80"
        >
          View full analytics
        </Link>
      </div>
    </div>
  );
}
