"use client";

import { useEffect, useState } from "react";
import { api, type ProjectEvent } from "@/lib/api";
import { Clock } from "lucide-react";
import { toast } from "sonner";

const EVENT_ICONS: Record<string, string> = {
  stage_change: "~",
  message: "m",
  deliverable: "d",
  spec_update: "s",
  approval: "a",
  invite: "i",
};

const ACTOR_LABELS: Record<string, string> = {
  client: "You",
  kaizen: "Kaizen",
  system: "System",
};

/* Map internal "Status changed from X to Y" to client-friendly messages */
const STATUS_TRANSITION_MESSAGES: Record<string, string> = {
  "intake_received->spec_writing": "We are reviewing your project",
  "intake_received->spec_ready": "Your project specification is ready",
  "spec_writing->spec_ready": "Your project specification is ready",
  "spec_ready->building": "Building your website",
  "building->pending_review": "Your website preview is being reviewed",
  "pending_review->review_ready": "Your website preview is ready for your review",
  "review_ready->approved": "You approved the preview",
  "approved->live": "Your website is live",
  "revising->building": "Building updated preview",
  "revising->pending_review": "Updated preview is being reviewed",
  "revising->review_ready": "Updated preview is ready for your review",
};

function friendlyDescription(description: string): string {
  // Match "Status changed from X to Y" pattern
  const match = description.match(/^Status changed from (\S+) to (\S+)$/i);
  if (match) {
    const key = `${match[1]}->${match[2]}`;
    if (STATUS_TRANSITION_MESSAGES[key]) return STATUS_TRANSITION_MESSAGES[key];
    if (match[2] === "revising") return "Revisions in progress";
    // Fallback: never show internal status names to clients
    return "Project status updated";
  }
  return description;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ProjectActivityFeed({ token, createdAt }: { token: string; createdAt?: string }) {
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api
      .getEvents(token, 50)
      .then((data) => {
        setEvents(data.events);
        setTotal(data.total);
      })
      .catch(() => toast.error("Failed to load activity"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-6 w-6 rounded-full ds-skeleton" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 ds-skeleton" />
              <div className="h-2 w-1/4 ds-skeleton" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Prepend synthetic "Project submitted" event from createdAt
  const allEvents = createdAt
    ? [
        ...events,
        {
          type: "stage_change" as const,
          description: "Project submitted",
          actor: "client" as const,
          at: createdAt,
        },
      ]
    : events;

  if (allEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Clock className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-foreground/80">No activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Events will appear here as your project progresses.</p>
      </div>
    );
  }

  const displayed = showAll ? allEvents : allEvents.slice(0, 5);

  return (
    <div className="space-y-1">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0 left-3 w-px bg-border/60" />

        {displayed.map((event, i) => (
          <div
            key={i}
            className="activity-item relative flex gap-3 py-2.5 pl-1"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Icon dot */}
            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-medium uppercase tracking-wide text-muted-foreground ring-1 ring-border/60">
              {EVENT_ICONS[event.type] || "·"}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">{friendlyDescription(event.description)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {ACTOR_LABELS[event.actor] || event.actor} · {timeAgo(event.at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {allEvents.length > 5 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="group mt-2 inline-flex w-full items-center justify-center text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <span className="relative">
            Show all {total} events
            <span className="absolute inset-x-0 -bottom-px h-px bg-primary/40 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
          </span>
        </button>
      )}
    </div>
  );
}
