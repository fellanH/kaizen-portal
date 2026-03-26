"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Project, type Message } from "@/lib/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectMessage extends Message {
  project_token: string;
  company_name: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No messages yet. Messages from your projects will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Link
              key={msg.id}
              href={`/projects/detail?token=${msg.project_token}`}
            >
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {msg.company_name}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {msg.from}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {msg.text}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
