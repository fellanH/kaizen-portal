"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, type Project, type Message } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronRight, ExternalLink } from "lucide-react";

const STAGES = [
  { key: "intake_received", label: "Received" },
  { key: "spec_writing", label: "Spec Writing" },
  { key: "building", label: "Building" },
  { key: "review_ready", label: "Review Ready" },
  { key: "live", label: "Live" },
];

function stageIndex(status: string) {
  const idx = STAGES.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

function StatusTimeline({ status }: { status: string }) {
  const current = stageIndex(status);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {STAGES.map((stage, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;

        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-2 border-primary bg-primary/20 text-primary"
                      : "border border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-1 text-[10px] whitespace-nowrap ${
                  isCurrent
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={`mx-1 mb-4 h-0.5 w-6 ${
                  i < current ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MessageThread({
  messages,
  onSend,
}: {
  messages: Message[];
  onSend: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    await onSend(text.trim());
    setText("");
    setSending(false);
  }

  return (
    <div className="space-y-4">
      <div className="max-h-80 space-y-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No messages yet.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.from === "client"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    msg.from === "client"
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Textarea
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[44px] resize-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={sending || !text.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}

function PreviewFrame({ url }: { url: string }) {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  const widths = { mobile: 375, tablet: 768, desktop: 1280 };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["mobile", "tablet", "desktop"] as const).map((v) => (
          <Button
            key={v}
            variant={viewport === v ? "default" : "outline"}
            size="sm"
            onClick={() => setViewport(v)}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </Button>
        ))}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto"
        >
          <Button variant="ghost" size="sm">
            <ExternalLink className="mr-1 h-3 w-3" />
            Open
          </Button>
        </a>
      </div>
      <div className="flex justify-center overflow-hidden rounded-lg border bg-white">
        <iframe
          src={url}
          className="h-[600px] border-0"
          style={{ width: widths[viewport] }}
          title="Preview"
        />
      </div>
    </div>
  );
}

export function ProjectDetail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMsg, setRevisionMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProject = useCallback(() => {
    if (!token) return;
    api
      .getProject(token)
      .then(setProject)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProject();
    const interval = setInterval(fetchProject, 15000);
    return () => clearInterval(interval);
  }, [fetchProject, token]);

  async function handleApprove() {
    if (!token) return;
    setActionLoading(true);
    try {
      await api.approve(token, "approve");
      fetchProject();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevision() {
    if (!token) return;
    setActionLoading(true);
    try {
      await api.approve(token, "revise", revisionMsg);
      setRevisionOpen(false);
      setRevisionMsg("");
      fetchProject();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendMessage(text: string) {
    if (!token) return;
    await api.sendMessage(token, text);
    fetchProject();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!token || !project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const showActions = project.status === "review_ready";

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground">
          Projects
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{project.company_name}</span>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline status={project.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Company</dt>
                <dd className="font-medium">{project.company_name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tier</dt>
                <dd>
                  <Badge variant="secondary">{project.tier}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Started</dt>
                <dd>{new Date(project.created_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last updated</dt>
                <dd>{new Date(project.updated_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {project.spec_content && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Specification</CardTitle>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  View full spec
                </summary>
                <div className="mt-4 text-sm">
                  <pre className="whitespace-pre-wrap rounded-md bg-muted p-4">
                    {project.spec_content}
                  </pre>
                </div>
              </details>
            </CardContent>
          </Card>
        )}

        {project.deliverables?.preview_url && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <PreviewFrame url={project.deliverables.preview_url} />
            </CardContent>
          </Card>
        )}

        {showActions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Your project is ready for review. Please approve it or request
                revisions.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleApprove} disabled={actionLoading}>
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRevisionOpen(true)}
                  disabled={actionLoading}
                >
                  Request Revision
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageThread
              messages={project.messages || []}
              onSend={handleSendMessage}
            />
          </CardContent>
        </Card>

        {project.deliverables?.urls && project.deliverables.urls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.deliverables.urls.map((d, i) => (
                  <li key={i}>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {d.label}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="What changes would you like?"
            value={revisionMsg}
            onChange={(e) => setRevisionMsg(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevisionOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRevision} disabled={actionLoading}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
