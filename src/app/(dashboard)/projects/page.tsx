"use client";

import Link from "next/link";
import { ExternalLink, Plus, PlusCircle, Trash2 } from "lucide-react";
import { api, type Project } from "@/lib/api";
import { useProjects } from "@/lib/projects-context";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "@/lib/slugify";

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
    bg: "status-neutral",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  spec_writing: {
    label: "Scoping",
    bg: "status-amber",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  building: {
    label: "Building",
    bg: "status-blue",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  review_ready: {
    label: "Review Ready",
    bg: "status-orange",
    text: "text-primary",
    dot: "bg-primary",
  },
  approved: {
    label: "Approved",
    bg: "status-emerald",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  revising: {
    label: "Revising",
    bg: "status-amber",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  live: {
    label: "Delivered",
    bg: "status-emerald",
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

  if (imageUrl && imageUrl !== "undefined") {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={`${project.company_name || "Project"} preview`}
          className="h-full w-full object-cover object-top transition-transform duration-500"
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/5" />
      </div>
    );
  }

  const name = project.company_name || "Project";
  const hue =
    name
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
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
          {name
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 3)}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/5" />
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
            backgroundColor: status === "live" ? "#22c55e" : status === "review_ready" ? "#e85325" : status === "building" ? "#3b82f6" : "#e85325",
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

/* ── Status badge using shadcn Badge ── */
function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.intake_received;
  return (
    <Badge variant="outline" className={`gap-1.5 border-0 ${cfg.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </Badge>
  );
}

/* ── Project card using shadcn Card ── */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const days = project.created_at ? daysSince(project.created_at) : 0;

  return (
    <Link
      href={`/project/${slugify(project.company_name)}`}
      className="project-card-enter group block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Card className="overflow-hidden border-border bg-card py-0 transition-all duration-400 hover:-translate-y-0.5 hover:ring-primary/30 hover:shadow-[0_8px_30px_-12px] hover:shadow-primary/10">
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
        <CardContent className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <h3
              className="text-lg font-medium leading-tight tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              {project.company_name || "Untitled Project"}
            </h3>
            {project.status === "live" && project.deliverables?.preview_url && (
              <p className="truncate text-xs text-muted-foreground/60">
                {project.deliverables.preview_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </p>
            )}
            <div className="flex items-center gap-2">
              <StatusBadge status={project.status} />
              <span className="text-xs text-muted-foreground/60">
                {tierLabels[project.tier] || project.tier}
              </span>
            </div>
          </div>

          <PipelineProgress status={project.status} />

          <Separator className="opacity-50" />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {project.created_at ? `Started ${formatDate(project.created_at)}` : ""}
            </span>
            <div className="flex items-center gap-2">
              {project.status === "live" && project.deliverables?.preview_url ? (
                <a
                  href={project.deliverables.preview_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 transition-colors duration-200 hover:bg-emerald-500/20 dark:text-emerald-400"
                >
                  <ExternalLink className="h-3 w-3" />
                  Visit Site
                </a>
              ) : (
                <span className="text-xs text-muted-foreground/60">
                  {days === 0 ? "Today" : `${days}d ago`}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!confirm(`Delete "${project.company_name}"? This cannot be undone.`)) return;
                  api.deleteProject(project.token)
                    .then(() => { toast.success("Project deleted"); window.location.reload(); })
                    .catch(() => toast.error("Failed to delete project"));
                }}
                className="rounded p-1 text-muted-foreground/40 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Delete project"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── New project CTA card ── */
function NewProjectCard({ index }: { index: number }) {
  return (
    <Link
      href="/projects/new"
      className="project-card-enter group block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Card className="flex h-full flex-col items-center justify-center border-2 border-dashed border-border/60 bg-transparent px-6 py-16 text-center ring-0 transition-all duration-400 hover:border-primary/40 hover:bg-primary/[0.03]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors duration-300 group-hover:bg-primary/10">
          <Plus className="h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground/80">Start a new project</p>
        <p className="mt-1 text-xs text-muted-foreground/60">Tell us what you need</p>
      </Card>
    </Link>
  );
}

/* ── Page header ── */
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
        <div className="flex items-center gap-4">
          {count > 0 && (
            <span className="text-sm text-muted-foreground">
              {count} {count === 1 ? "project" : "projects"}
            </span>
          )}
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/20"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Project
          </Link>
        </div>
      </div>
      <Separator />
    </div>
  );
}

/* ── Loading skeleton using shadcn Skeleton ── */
function ProjectSkeleton() {
  return (
    <Card className="overflow-hidden py-0">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <CardContent className="space-y-3 px-5 py-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-1 w-full rounded-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </CardContent>
    </Card>
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
  const { projects, loading } = useProjects();

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
            <NewProjectCard index={projects.length} />
          </div>
        )}
      </div>
    </div>
  );
}
