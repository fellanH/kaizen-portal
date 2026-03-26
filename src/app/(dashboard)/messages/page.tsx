"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api, type Project, type Message } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Search } from "lucide-react";

interface ProjectMessage extends Message {
  project_token: string;
  company_name: string;
}

function MessageSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
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
      .catch(() => {})
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
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        {messages.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>

      {loading ? (
        <MessageSkeleton />
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Messages from your projects will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Search className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No results</p>
              <p className="text-sm text-muted-foreground">
                No messages match &quot;{search}&quot;
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {date}
              </p>
              <div className="space-y-2">
                {msgs.map((msg, i) => (
                  <Link
                    key={msg.id}
                    href={`/projects/detail?token=${msg.project_token}`}
                    className="animate-stagger-up block"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <Card className="transition-colors hover:border-primary/50">
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {msg.company_name}
                              </span>
                              <Badge
                                variant={
                                  msg.from === "kaizen"
                                    ? "default"
                                    : "outline"
                                }
                                className="text-[10px]"
                              >
                                {msg.from}
                              </Badge>
                            </div>
                            <p className="truncate text-sm text-muted-foreground">
                              {msg.text}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
