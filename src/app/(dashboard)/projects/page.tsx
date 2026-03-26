"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Project } from "@/lib/api";

/* ── Pipeline stages in logical order ── */
const PIPELINE_STAGES = [
  "intake_received",
  "spec_writing",
  "building",
  "review_ready",
  "live",
] as const;

/* ── Status config: label, color classes, dot color ── */
const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  intake_received: {
    label: "Received",
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  spec_writing: {
    label: "Scoping",
    bg: "bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  building: {
    label: "Building",
    bg: "bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  review_ready: {
    label: "Review Ready",
    bg: "bg-primary/15",
    text: "text-primary",
    dot: "bg-primary",
  },
  live: {
    label: "Delivered",
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
};

const tierLabels: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  premium: "Premium",
};

function getStageProgress(status: string): number {
  const idx = PIPELINE_STAGES.indexOf(status as (typeof PIPELINE_STAGES)[number]);
  if (idx < 0) return 0;
  return ((idx + 1) / PIPELINE_STAGES.length) * 100;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysSince(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

/* ── Thumbnail: screenshot, deliverable preview, or styled placeholder ── */
function ProjectThumbnail({ project }: { project: Project }) {
  const imageUrl =
    project.original_screenshot_url || project.deliverables?.preview_url;

  if (imageUrl) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={imageUrl}
          alt={`${project.company_name} preview`}
          className="h-full w-full object-cover object-top transition-transform duration-500"
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-foreground/5" />
      </div>
    );
  }

  /* Styled placeholder: abstract gradient mesh */
  const hue =
    project.company_name
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 40%, oklch(0.6 0.08 ${hue}) 0%, transparent 70%), radial-gradient(ellipse at 70% 60%, oklch(0.5 0.06 ${(hue + 120) % 360}) 0%, transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[clamp(1.5rem,2vw,2.5rem)] font-light tracking-tight text-foreground/20"
          style={{ letterSpacing: "-0.03em" }}
        >
          {project.company_name
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 3)}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-foreground/5" />
    </div>
  );
}

/* ── Pipeline progress bar ── */
function PipelineProgress({ status }: { status: string }) {
  const progress = getStageProgress(status);
  const cfg = statusConfig[status] || statusConfig.intake_received;

  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            backgroundColor: "var(--primary)",
            opacity: status === "live" ? 1 : 0.7,
          }}
        />
      </div>
      <span className={`shrink-0 text-xs font-medium ${cfg.text}`}>
        {Math.round(progress)}%
      </span>
    </div>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.intake_received;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── Project card ── */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const days = daysSince(project.created_at);

  return (
    <Link
      href={`/projects/detail?token=${project.token}`}
      className="project-card-enter group block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <article className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-400 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_30px_-12px] hover:shadow-primary/10">
        {/* Thumbnail */}
        <div className="overflow-hidden">
          <div
            className="transition-transform duration-500 group-hover:scale-[1.02]"
            style={{
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <ProjectThumbnail project={project} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 p-5">
          {/* Company name: most prominent element */}
          <div className="space-y-1.5">
            <h3
              className="text-lg font-medium leading-tight tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              {project.company_name}
            </h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={project.status} />
              <span className="text-xs text-muted-foreground/60">
                {tierLabels[project.tier] || project.tier}
              </span>
            </div>
          </div>

          {/* Pipeline progress */}
          <PipelineProgress status={project.status} />

          {/* Meta row */}
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <span className="text-xs text-muted-foreground">
              Started {formatDate(project.created_at)}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {days === 0 ? "Today" : `${days}d ago`}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ── Page header with decorative line ── */
function PageHeader({ count }: { count: number }) {
  return (
    <div className="kaizen-enter-1 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60"
            style={{ letterSpacing: "0.08em" }}
          >
            Portfolio
          </p>
          <h1
            className="mt-1 text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            Your Projects
          </h1>
        </div>
        {count > 0 && (
          <span className="text-sm text-muted-foreground">
            {count} {count === 1 ? "project" : "projects"}
          </span>
        )}
      </div>
      <div className="kaizen-line h-px bg-border" />
    </div>
  );
}

/* ── Loading skeleton ── */
function ProjectSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[16/10] w-full skeleton-shimmer" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded skeleton-shimmer" />
        <div className="h-4 w-1/3 rounded skeleton-shimmer" />
        <div className="h-1 w-full rounded-full skeleton-shimmer" />
        <div className="flex justify-between pt-2">
          <div className="h-3 w-24 rounded skeleton-shimmer" />
          <div className="h-3 w-12 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div className="kaizen-enter-2 flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <svg
          className="h-7 w-7 text-muted-foreground/40"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          />
        </svg>
      </div>
      <p className="text-base text-foreground/80">No projects yet</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        When your project kicks off, it will appear here as part of your
        portfolio.
      </p>
    </div>
  );
}

/* ── Main page ── */
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMyProjects()
      .then((data) => setProjects(data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-14">
      <PageHeader count={projects.length} />

      <div className="mt-10">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[0, 1, 2].map((i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project, i) => (
              <ProjectCard key={project.token} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
