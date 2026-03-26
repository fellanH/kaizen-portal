"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api, type Project, type Message } from "@/lib/api";
import { toast } from "sonner";
import { MessageSquare, Search } from "lucide-react";

interface ProjectMessage extends Message {
  project_token: string;
  company_name: string;
}

function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 ds-skeleton" />
            <div className="h-4 w-12 ds-skeleton" />
          </div>
          <div className="h-4 w-3/4 ds-skeleton" />
        </div>
      ))}
    </div>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .getMyProjects()
      .then((data) => {
        const allMessages: ProjectMessage[] = [];
        for (const project of data.projects) {
          if (project.messages) {
            for (const msg of project.messages) {
              allMessages.push({
                ...msg,
                project_token: project.token,
                company_name: project.company_name,
              });
            }
          }
        }
        allMessages.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        setMessages(allMessages);
      })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        m.company_name.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, ProjectMessage[]> = {};
    for (const msg of filtered) {
      const date = new Date(msg.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-14">
      {/* Page header */}
      <div className="kaizen-enter-1 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-[0.6rem] font-medium uppercase text-muted-foreground/60"
              style={{ letterSpacing: "0.08em" }}
            >
              Communication
            </p>
            <h1
              className="mt-1 text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
              style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
            >
              Messages
            </h1>
          </div>
          {messages.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          )}
        </div>
        <div className="kaizen-line h-px bg-border" />
      </div>

      {/* Search */}
      {messages.length > 0 && (
        <div className="kaizen-enter-2 relative mt-8">
          <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-0 border-b border-border/60 bg-transparent py-2.5 pl-7 pr-0 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
            style={{ fontFamily: "var(--font-aspekta)" }}
          />
        </div>
      )}

      {/* Content */}
      <div className="mt-10">
        {loading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="kaizen-enter-2 flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <MessageSquare className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-base text-foreground/80">No messages yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Messages from your projects will appear here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Search className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-base text-foreground/80">No results</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              No messages match &quot;{search}&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <p
                  className="mb-4 text-[0.6rem] font-medium uppercase text-muted-foreground/60"
                  style={{ letterSpacing: "0.08em" }}
                >
                  {date}
                </p>
                <div className="space-y-1">
                  {msgs.map((msg, i) => (
                    <Link
                      key={msg.id}
                      href={`/projects/detail?token=${msg.project_token}`}
                      className="ds-section group block rounded-lg px-4 py-3 transition-colors duration-200 hover:bg-muted/50"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2.5">
                            <span className="text-sm font-medium tracking-[-0.01em]">
                              {msg.company_name}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                msg.from === "kaizen"
                                  ? "status-orange"
                                  : "status-neutral"
                              }`}
                            >
                              {msg.from === "kaizen" ? "Kaizen" : "You"}
                            </span>
                          </div>
                          <p className="truncate text-sm leading-[1.6] text-muted-foreground">
                            {msg.text}
                          </p>
                        </div>
                        <span className="shrink-0 pt-0.5 text-xs text-muted-foreground/60">
                          {new Date(msg.created_at).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
