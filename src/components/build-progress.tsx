"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api, type Project } from "@/lib/api";
import { toast } from "sonner";
import { RefreshCw, Mail } from "lucide-react";

interface ProgressPhase {
  key: string;
  label: string;
  activeLabel: string;
  detail?: string;
}

const PHASES: ProgressPhase[] = [
  { key: "crawl_complete", label: "Explored your website", activeLabel: "Exploring your website..." },
  { key: "strategy_complete", label: "Understood your business", activeLabel: "Understanding your business..." },
  { key: "creative_complete", label: "Wrote your story", activeLabel: "Writing your story..." },
  { key: "structure_complete", label: "Designed your pages", activeLabel: "Designing your pages..." },
  { key: "render_complete", label: "Built your website", activeLabel: "Building your website..." },
];

function parseProgressEvent(description: string): { phase: string; [k: string]: unknown } | null {
  try {
    return JSON.parse(description);
  } catch {
    return null;
  }
}

function getCompletedPhases(project: Project): Map<string, Record<string, unknown>> {
  const completed = new Map<string, Record<string, unknown>>();
  for (const event of project.events || []) {
    if ((event.actor as string) === "pipeline" || event.type === "stage_change") {
      const parsed = parseProgressEvent(event.description);
      if (parsed?.phase) {
        completed.set(parsed.phase, parsed);
      }
    }
  }
  return completed;
}

const MAX_POLLS = 200;
const STALE_THRESHOLD = 100;

export function BuildProgress({ token, onActiveChange }: { token: string; onActiveChange?: (active: boolean) => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [completedPhases, setCompletedPhases] = useState<Map<string, Record<string, unknown>>>(new Map());
  const [timedOut, setTimedOut] = useState(false);
  const pollCountRef = useRef(0);
  const staleCountRef = useRef(0);
  const lastStatusRef = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchProject = useCallback(async () => {
    try {
      const p = await api.getProject(token);
      setProject(p);
      setCompletedPhases(getCompletedPhases(p));

      // Track stale status (no change)
      if (p.status === lastStatusRef.current) {
        staleCountRef.current++;
      } else {
        staleCountRef.current = 0;
        lastStatusRef.current = p.status;
      }

      pollCountRef.current++;

      // Timeout: max polls or stale too long
      if (pollCountRef.current >= MAX_POLLS || staleCountRef.current >= STALE_THRESHOLD) {
        setTimedOut(true);
        stopPolling();
      }
    } catch {
      // Silent retry on next poll
    }
  }, [token, stopPolling]);

  const resetAndResume = useCallback(() => {
    pollCountRef.current = 0;
    staleCountRef.current = 0;
    setTimedOut(false);
    fetchProject();
    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchProject, 3000);
    }
  }, [fetchProject]);

  useEffect(() => {
    fetchProject();
    intervalRef.current = setInterval(fetchProject, 3000);

    // Visibility guard: pause when tab hidden, resume when visible
    function handleVisibility() {
      if (document.hidden) {
        stopPolling();
      } else if (!timedOut) {
        if (!intervalRef.current) {
          fetchProject();
          intervalRef.current = setInterval(fetchProject, 3000);
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchProject, stopPolling, timedOut]);

  // Notify parent whether BuildProgress is actively polling a build
  const isActive = project ? ["spec_ready", "building", "build_failed"].includes(project.status) : false;
  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  if (!project) return null;

  const isBuilding = ["spec_ready", "building"].includes(project.status);
  const isFailed = project.status === "build_failed";
  const isReady = ["review_ready", "approved", "live", "pending_review"].includes(project.status);

  if (!isBuilding && !isFailed && !isReady) return null;

  // Find current active phase
  let activePhaseIdx = -1;
  for (let i = 0; i < PHASES.length; i++) {
    if (!completedPhases.has(PHASES[i].key)) {
      activePhaseIdx = i;
      break;
    }
  }
  if (isReady) activePhaseIdx = PHASES.length; // All done

  const strategyData = completedPhases.get("strategy_complete");
  const creativeData = completedPhases.get("creative_complete");
  const structureData = completedPhases.get("structure_complete");

  return (
    <div className="space-y-1">
      {/* Phase timeline */}
      {PHASES.map((phase, idx) => {
        const isComplete = completedPhases.has(phase.key);
        const isActive = idx === activePhaseIdx && isBuilding;
        const isPending = idx > activePhaseIdx || (idx === activePhaseIdx && !isBuilding && !isComplete);

        return (
          <div key={phase.key} className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`mt-1 h-3 w-3 rounded-full border-2 transition-all duration-500 ${
                  isComplete
                    ? "border-emerald-500 bg-emerald-500"
                    : isActive
                      ? "border-primary bg-primary animate-pulse"
                      : isFailed && idx === activePhaseIdx
                        ? "border-red-500 bg-red-500"
                        : "border-muted-foreground/20 bg-transparent"
                }`}
              />
              {idx < PHASES.length - 1 && (
                <div
                  className={`my-1 w-px flex-1 min-h-[28px] transition-colors duration-500 ${
                    isComplete ? "bg-emerald-500/40" : "bg-muted-foreground/10"
                  }`}
                />
              )}
            </div>

            {/* Phase content */}
            <div className={`pb-4 ${isPending ? "opacity-30" : ""} transition-opacity duration-300`}>
              <p className={`text-sm font-medium ${isActive ? "text-foreground" : isComplete ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                {isActive ? phase.activeLabel : phase.label}
              </p>

              {/* Strategy summary */}
              {phase.key === "strategy_complete" && isComplete && strategyData?.summary ? (
                <p className="mt-1 text-xs text-muted-foreground/70 leading-relaxed max-w-md line-clamp-3">
                  {String(strategyData.summary).substring(0, 200)}
                </p>
              ) : null}

              {/* Creative preview */}
              {phase.key === "creative_complete" && isComplete && creativeData ? (
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {creativeData.headline_preview ? `"${String(creativeData.headline_preview)}"` : ""}
                  {creativeData.word_count ? ` · ${String(creativeData.word_count)} words` : ""}
                </p>
              ) : null}

              {/* Structure summary */}
              {phase.key === "structure_complete" && isComplete && structureData ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/70">
                    {String(structureData.pages)} pages · {String(structureData.sections)} sections
                  </span>
                  {structureData.accent_color ? (
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-border/50"
                      style={{ backgroundColor: String(structureData.accent_color) }}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* Ready state */}
      {isReady && project.deliverables?.preview_url && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-1 h-3 w-3 rounded-full border-2 border-emerald-500 bg-emerald-500" />
          </div>
          <div className="pb-2">
            <p className="text-sm font-medium text-emerald-600">Your website is ready.</p>
            <a
              href={project.deliverables.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View Your Site
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
        </div>
      )}

      {/* Timeout state */}
      {timedOut && isBuilding && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-1 h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-500" />
          </div>
          <div className="pb-2">
            <p className="text-sm font-medium text-amber-600">Build is taking longer than expected</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This can happen with complex websites. You can wait or contact us for help.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={resetAndResume}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
              <a
                href="mailto:hello@hi-kaizen.com"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <Mail className="h-3 w-3" />
                Contact support
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Failed state */}
      {isFailed && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-1 h-3 w-3 rounded-full border-2 border-red-500 bg-red-500" />
          </div>
          <div className="pb-2">
            <p className="text-sm font-medium text-red-600">Build failed</p>
            {completedPhases.has("build_failed") ? (
              <p className="mt-1 text-xs text-red-500/70">
                {String(completedPhases.get("build_failed")?.error || "Unknown error").substring(0, 200)}
              </p>
            ) : null}
            <button
              onClick={async () => {
                try {
                  await api.retryBuild(token);
                  toast.success("Build restarted");
                  fetchProject();
                } catch {
                  toast.error("Failed to retry build");
                }
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Retry Build
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
