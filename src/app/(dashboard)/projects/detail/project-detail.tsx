"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, type Project, type Message } from "@/lib/api";
import { ExternalLink, ChevronDown, Monitor, Tablet, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { ProjectSpecReader } from "@/components/project-spec-reader";
import { ProjectContractViewer } from "@/components/project-contract-viewer";
import { ProjectBeforeAfter } from "@/components/project-before-after";
import { ProjectActivityFeed } from "@/components/project-activity-feed";
import { ProjectCmsOnboarding } from "@/components/project-cms-onboarding";
import { ProjectPrimaryAction } from "@/components/project-primary-action";
import { ProjectStageIndicator } from "@/components/project-stage-indicator";
import { ProjectLaunchFlow } from "@/components/project-launch-flow";
import { ProjectDomainCheck } from "@/components/project-domain-check";
import { ProjectAnalyticsSummary } from "@/components/project-analytics-summary";
import { ProjectContentEditor } from "@/components/project-content-editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Status config with semantic colors ── */
const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  intake_received: { label: "Received", className: "status-neutral", dot: "bg-muted-foreground/60" },
  spec_writing: { label: "Scoping", className: "status-amber", dot: "bg-amber-500" },
  spec_ready: { label: "Spec Ready", className: "status-amber", dot: "bg-amber-500" },
  building: { label: "Building", className: "status-blue", dot: "bg-blue-500" },
  pending_review: { label: "Under Review", className: "status-blue", dot: "bg-blue-500" },
  review_ready: { label: "Review Ready", className: "status-orange", dot: "bg-primary" },
  approved: { label: "Approved", className: "status-emerald", dot: "bg-emerald-500" },
  revising: { label: "Revising", className: "status-amber", dot: "bg-amber-500" },
  live: { label: "Delivered", className: "status-emerald", dot: "bg-emerald-500" },
};

const tierLabels: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  premium: "Premium",
};

/* ── Message consolidation: merge rapid-fire messages (<60s, same sender) ── */
function consolidateMessages(msgs: Message[]): Message[] {
  const result: Message[] = [];
  for (const msg of msgs) {
    const prev = result[result.length - 1];
    if (prev && prev.from === msg.from) {
      const gap = Math.abs(
        new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()
      );
      if (gap < 60000) {
        prev.text = prev.text + "\n" + msg.text;
        continue;
      }
    }
    result.push({ ...msg });
  }
  return result;
}

/* ── Message Thread ── */
function MessageThread({
  messages,
  onSend,
}: {
  messages: Message[];
  onSend: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const consolidated = consolidateMessages(messages);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSend(text.trim());
      setText("");
    } catch {
      // error toast shown by parent
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
        {consolidated.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No messages yet. Start a conversation with the Kaizen team.
          </p>
        ) : (
          consolidated.map((msg, i) => (
            <div
              key={msg.id}
              className={`msg-bubble flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-[1.6] ${
                  msg.from === "client"
                    ? "bg-muted/80 text-foreground"
                    : "bg-primary/10 text-foreground border border-primary/10"
                }`}
              >
                {msg.text.split("\n").map((line, li) => (
                  <p key={li}>{line}</p>
                ))}
                <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className={`inline-flex items-center rounded-full px-1.5 py-px text-[9px] font-medium ${
                    msg.from === "kaizen"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {msg.from === "kaizen" ? "Kaizen" : "You"}
                  </span>
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <Separator />
      <div className="flex gap-3 pt-1">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border-0 border-b border-border/60 bg-transparent px-0 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
          style={{ fontFamily: "var(--font-aspekta)" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="group inline-flex items-center gap-2 text-sm text-foreground transition-all duration-200 disabled:opacity-30"
        >
          <span className="relative">
            Send
            <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary" />
          </span>
          <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Preview Frame with viewport switcher ── */
function PreviewFrame({ url }: { url: string }) {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const widths = { mobile: 375, tablet: 768, desktop: 1280 };
  const icons = { mobile: Smartphone, tablet: Tablet, desktop: Monitor };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        {(["desktop", "tablet", "mobile"] as const).map((v) => {
          const Icon = icons[v];
          return (
            <button
              key={v}
              onClick={() => setViewport(v)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors duration-200 ${
                viewport === v
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          );
        })}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" />
          Open in new tab
        </a>
      </div>
      <div className="flex justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/20">
        <iframe
          src={url}
          className="h-[700px] border-0"
          style={{ width: widths[viewport] }}
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}

/* ── Collapsible section wrapper ── */
function CollapsibleSection({
  id,
  label,
  title,
  defaultOpen = true,
  children,
}: {
  id?: string;
  label?: string;
  title?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card id={id}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 pt-4 pb-2 text-left"
      >
        <div>
          {label && (
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
              {label}
            </p>
          )}
          {title && (
            <h2 className="mt-0.5 text-base font-light tracking-[-0.02em]">{title}</h2>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground/40 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <CardContent className="px-5 pb-5">{children}</CardContent>}
    </Card>
  );
}

/* ── Loading skeleton ── */
function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14">
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <Separator className="mt-6" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    </div>
  );
}

/* ── Visibility helpers ── */
type Status = "intake_received" | "spec_writing" | "spec_ready" | "building" | "pending_review" | "review_ready" | "approved" | "revising" | "live";

function showPreview(hasUrl: boolean) {
  return hasUrl;
}
function showBeforeAfter(s: Status, hasOriginal: boolean, hasPreview: boolean) {
  if (!hasOriginal || !hasPreview) return false;
  return s === "review_ready" || s === "live";
}
function showSpec(s: Status, hasContent: boolean) {
  if (!hasContent) return false;
  return s === "spec_writing" || s === "spec_ready" || s === "building" || s === "review_ready" || s === "pending_review";
}
function showDomain(s: Status) { return s === "live"; }
function showCms(s: Status, hasUrl: boolean) { return s === "live" && hasUrl; }
function showEditor(s: Status, hasPreview: boolean) {
  return hasPreview && (s === "review_ready" || s === "pending_review" || s === "building");
}

/* ── Main Component ── */
export function ProjectDetail({ token: tokenProp }: { token?: string } = {}) {
  const searchParams = useSearchParams();
  const [hashToken, setHashToken] = useState<string | null>(null);
  useEffect(() => {
    if (tokenProp) return;
    const hash = window.location.hash.slice(1).split('#')[0];
    if (hash) setHashToken(hash);
  }, [tokenProp]);
  const token = tokenProp || hashToken || searchParams.get("token");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [launchDismissed, setLaunchDismissed] = useState(true);

  const fetchProject = useCallback(() => {
    if (!token) return;
    api
      .getProject(token)
      .then(setProject)
      .catch(() => toast.error("Failed to load project"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProject();

    let interval: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (interval) return;
      interval = setInterval(() => {
        if (!document.hidden) fetchProject();
      }, 15000);
    }

    function stopPolling() {
      if (interval) { clearInterval(interval); interval = null; }
    }

    function handleVisibility() {
      if (document.hidden) stopPolling();
      else startPolling();
    }

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchProject, token]);

  useEffect(() => {
    if (project?.company_name) {
      document.title = `${project.company_name} | Kaizen`;
    }
    return () => { document.title = "Kaizen"; };
  }, [project?.company_name]);

  useEffect(() => {
    if (project?.status === "live" && token) {
      const key = `kaizen_launch_dismissed_${token}`;
      setLaunchDismissed(localStorage.getItem(key) === "true");
    }
  }, [project?.status, token]);

  async function handleApprove() {
    if (!token) return;
    setActionLoading(true);
    try {
      await api.approve(token, "approve");
      fetchProject();
    } catch {
      toast.error("Failed to approve project");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevision(message: string) {
    if (!token) return;
    setActionLoading(true);
    try {
      await api.approve(token, "revise", message);
      fetchProject();
    } catch {
      toast.error("Failed to submit revision request");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendMessage(text: string) {
    if (!token) return;
    try {
      await api.sendMessage(token, text);
      fetchProject();
    } catch {
      toast.error("Failed to send message");
      throw new Error("send failed");
    }
  }

  if (loading) return <DetailSkeleton />;

  if (!token || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  // Launch flow for freshly-live projects
  if (project.status === "live" && !launchDismissed) {
    return (
      <ProjectLaunchFlow
        project={project}
        onComplete={() => {
          localStorage.setItem(`kaizen_launch_dismissed_${token}`, "true");
          setLaunchDismissed(true);
        }}
      />
    );
  }

  const cfg = statusConfig[project.status] || statusConfig.intake_received;
  const s = project.status as Status;
  const previewUrl = project.deliverables?.preview_url;
  const hasPreviewUrl = !!previewUrl;
  const hasOriginalScreenshot = !!project.original_screenshot_url;
  const hasSpecContent = !!project.spec_content;
  const hasSanityUrl = !!project.deliverables?.sanity_studio_url;
  const hasDeliverableUrls = !!project.deliverables?.urls && project.deliverables.urls.length > 0;
  const messageCount = (project.messages || []).length;

  // Determine default tab: Preview if available, otherwise Messages
  const hasEditorTab = showEditor(s, hasPreviewUrl);
  const defaultTab = hasPreviewUrl ? "preview" : "messages";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14">
      {/* ── Page header (always visible above tabs) ── */}
      <div className="kaizen-enter-1">
        <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/projects"
            className="transition-colors duration-200 hover:text-foreground"
          >
            Projects
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground">{project.company_name}</span>
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
              style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
            >
              {project.company_name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`gap-1.5 border-0 ${cfg.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {tierLabels[project.tier] || project.tier}
              </span>
              <span className="text-xs text-muted-foreground/40">&middot;</span>
              <span className="text-xs text-muted-foreground">
                Started {new Date(project.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Stage indicator compact */}
          <div className="hidden sm:block">
            <ProjectStageIndicator status={project.status} />
          </div>
        </div>

        {/* Primary action card */}
        <div className="mt-6">
          <ProjectPrimaryAction
            project={project}
            token={token}
            onApprove={handleApprove}
            onRevise={handleRevision}
            actionLoading={actionLoading}
          />
        </div>

        <Separator className="mt-6" />
      </div>

      {/* ── Mobile stage indicator ── */}
      <div className="mt-4 flex justify-center sm:hidden">
        <ProjectStageIndicator status={project.status} />
      </div>

      {/* ── Tabbed content ── */}
      <div className="mt-6">
        <Tabs defaultValue={defaultTab}>
          <TabsList variant="line" className="w-full justify-start gap-0">
            {hasPreviewUrl && (
              <TabsTrigger value="preview" className="text-sm font-light">
                Preview
              </TabsTrigger>
            )}
            {hasEditorTab && (
              <TabsTrigger value="editor" className="text-sm font-light">
                Editor
              </TabsTrigger>
            )}
            <TabsTrigger value="messages" className="text-sm font-light">
              Messages
              {messageCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[0.6rem] font-medium text-primary">
                  {messageCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-sm font-light">
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Preview tab */}
          {hasPreviewUrl && (
            <TabsContent value="preview" className="mt-6">
              <div className="space-y-8">
                <PreviewFrame url={previewUrl!} />

                {showBeforeAfter(s, hasOriginalScreenshot, hasPreviewUrl) && (
                  <Card>
                    <CardHeader>
                      <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                        Comparison
                      </p>
                      <CardTitle className="font-light">Before / After</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProjectBeforeAfter
                        originalUrl={project.original_screenshot_url!}
                        previewUrl={project.deliverables!.preview_url!}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {/* Editor tab */}
          {hasEditorTab && (
            <TabsContent value="editor" className="mt-6">
              <Card>
                <CardHeader>
                  <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                    Content
                  </p>
                  <CardTitle className="font-light">Edit Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectContentEditor
                    slug={project.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}
                    token={token}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Messages tab */}
          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                  Communication
                </p>
                <CardTitle className="font-light">Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <MessageThread
                  messages={project.messages || []}
                  onSend={handleSendMessage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity tab */}
          <TabsContent value="activity" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                    History
                  </p>
                  <CardTitle className="font-light">Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectActivityFeed token={token} createdAt={project.created_at} />
                </CardContent>
              </Card>

              {showSpec(s, hasSpecContent) && (
                <CollapsibleSection label="Documentation" title="Specification">
                  <ProjectSpecReader specContent={project.spec_content!} />
                </CollapsibleSection>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Below-tabs sections (live-only) ── */}
      {s === "live" && (
        <div className="mt-10 space-y-6">
          <Separator />

          {showDomain(s) && (
            <Card>
              <CardHeader>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                  Infrastructure
                </p>
                <CardTitle className="font-light">Domain</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const hasCustomDomain = project.deliverables?.urls?.some(
                    (u) => u.url && !u.url.includes(".pages.dev")
                  );
                  const previewHost = project.deliverables?.preview_url
                    ? project.deliverables.preview_url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
                    : null;
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full ${hasCustomDomain ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="text-sm text-foreground">
                          {hasCustomDomain ? "Custom domain connected" : "Using Kaizen subdomain"}
                        </span>
                      </div>
                      {!hasCustomDomain && previewHost && (
                        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Connect your domain</p>
                            <p className="text-xs leading-[1.6] text-muted-foreground">
                              Add a CNAME record with your DNS provider pointing to:
                            </p>
                            <div className="overflow-x-auto rounded-md bg-muted/50 px-3 py-2">
                              <code className="text-xs text-foreground/80">
                                CNAME &rarr; {previewHost}
                              </code>
                            </div>
                          </div>
                          <ProjectDomainCheck targetHost={previewHost} projectToken={token} />
                          <p className="text-xs text-muted-foreground">
                            <button
                              onClick={() => {
                                if (!token) return;
                                api.sendMessage(token, "I'd like help connecting my custom domain to my website.").then(() => {
                                  toast.success("Message sent to Kaizen");
                                }).catch(() => {
                                  toast.error("Failed to send message");
                                });
                              }}
                              className="inline text-primary transition-colors duration-200 hover:text-primary/80"
                            >
                              Need help?
                            </button>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                Performance
              </p>
              <CardTitle className="font-light">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectAnalyticsSummary token={token} />
            </CardContent>
          </Card>

          {showCms(s, hasSanityUrl) && (
            <Card>
              <CardHeader>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                  Setup
                </p>
                <CardTitle className="font-light">CMS</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectCmsOnboarding
                  sanityStudioUrl={project.deliverables!.sanity_studio_url!}
                />
              </CardContent>
            </Card>
          )}

          {/* What's Next upsell */}
          <Card>
            <CardHeader>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                Opportunity
              </p>
              <CardTitle className="font-light">What&apos;s Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  href={`/projects/new?company=${encodeURIComponent(project.company_name)}&type=redesign`}
                  className="group rounded-lg border border-border/60 bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.03]"
                >
                  <p className="text-sm font-medium text-foreground">Order a refresh</p>
                  <p className="mt-1 text-xs leading-[1.5] text-muted-foreground/70">
                    Evolve your site with updated design and content
                  </p>
                </Link>
                <Link
                  href={`/projects/new?company=${encodeURIComponent(project.company_name)}&type=add-features&description=${encodeURIComponent("Add blog/CMS to existing site")}`}
                  className="group rounded-lg border border-border/60 bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.03]"
                >
                  <p className="text-sm font-medium text-foreground">Add a blog or CMS</p>
                  <p className="mt-1 text-xs leading-[1.5] text-muted-foreground/70">
                    Manage your own content with a headless CMS
                  </p>
                </Link>
                {project.tier !== "premium" && (
                  <Link
                    href={`/projects/new?company=${encodeURIComponent(project.company_name)}&type=redesign&tier=premium`}
                    className="group rounded-lg border border-border/60 bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.03]"
                  >
                    <p className="text-sm font-medium text-foreground">Upgrade your plan</p>
                    <p className="mt-1 text-xs leading-[1.5] text-muted-foreground/70">
                      Premium: custom animations, CMS, priority support
                    </p>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                Legal
              </p>
              <CardTitle className="font-light">Contract</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectContractViewer token={token} />
            </CardContent>
          </Card>

          {hasDeliverableUrls && (
            <Card>
              <CardHeader>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                  Files
                </p>
                <CardTitle className="font-light">Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.deliverables!.urls!.map((d, i) => (
                    <li key={i}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-sm text-foreground transition-colors duration-200"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-primary" />
                        <span className="relative">
                          {d.label}
                          <span className="absolute inset-x-0 -bottom-px h-px bg-primary/40 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
