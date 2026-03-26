"use client";

import { useEffect, useState } from "react";
import { api, type ProjectEvent } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const EVENT_ICONS: Record<string, string> = {
  stage_change: "🔄",
  message: "💬",
  deliverable: "📦",
  spec_update: "📝",
  approval: "✅",
  invite: "👤",
};

const ACTOR_LABELS: Record<string, string> = {
  client: "You",
  kaizen: "Kaizen",
  system: "System",
};

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

export function ProjectActivityFeed({ token }: { token: string }) {
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No activity yet.
      </p>
    );
  }

  const displayed = showAll ? events : events.slice(0, 5);

  return (
    <div className="space-y-1">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0 left-3 w-px bg-border" />

        {displayed.map((event, i) => (
          <div
            key={i}
            className="activity-item relative flex gap-3 py-2 pl-1"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Icon dot */}
            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-xs ring-1 ring-border">
              {EVENT_ICONS[event.type] || "·"}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">{event.description}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {ACTOR_LABELS[event.actor] || event.actor} · {timeAgo(event.at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {events.length > 5 && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="w-full text-xs"
        >
          Show all {total} events
        </Button>
      )}
    </div>
  );
}
