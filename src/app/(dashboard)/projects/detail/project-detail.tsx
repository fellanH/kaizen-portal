"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, type Project, type Message } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ProjectDeliveryTimeline } from "@/components/project-delivery-timeline";
import { ProjectSpecReader } from "@/components/project-spec-reader";
import { ProjectContractViewer } from "@/components/project-contract-viewer";
import { ProjectBeforeAfter } from "@/components/project-before-after";
import { ProjectActivityFeed } from "@/components/project-activity-feed";
import { ProjectCmsOnboarding } from "@/components/project-cms-onboarding";

/* ── Status config with semantic colors (B5 fix) ── */
const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  intake_received: { label: "Received", className: "status-neutral", dot: "bg-muted-foreground/60" },
  spec_writing: { label: "Scoping", className: "status-amber", dot: "bg-amber-500" },
  building: { label: "Building", className: "status-blue", dot: "bg-blue-500" },
  review_ready: { label: "Review Ready", className: "status-orange", dot: "bg-primary" },
  live: { label: "Delivered", className: "status-emerald", dot: "bg-emerald-500" },
};

const tierLabels: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  premium: "Premium",
};

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
      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No messages yet.
          </p>
        ) : (
          messages.map((msg, i) => (
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
                <p>{msg.text}</p>
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
      <div className="flex gap-3 border-t border-border/60 pt-4">
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

/* ── Preview Frame ── */
function PreviewFrame({ url }: { url: string }) {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const widths = { mobile: 375, tablet: 768, desktop: 1280 };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {(["mobile", "tablet", "desktop"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setViewport(v)}
            className={`text-xs transition-colors duration-200 ${
              viewport === v
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="relative">
              {v.charAt(0).toUpperCase() + v.slice(1)}
              {viewport === v && (
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary" />
              )}
            </span>
          </button>
        ))}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </a>
      </div>
      <div className="flex justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/30">
        <iframe
          src={url}
          className="h-[600px] border-0"
          style={{ width: widths[viewport] }}
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({
  label,
  title,
  children,
}: {
  label?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ds-section">
      <div className="ds-rule mb-6" />
      {label && (
        <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
          {label}
        </p>
      )}
      {title && (
        <h2 className="mt-1 mb-5 text-lg font-light tracking-[-0.02em]">{title}</h2>
      )}
      {!title && label && <div className="mb-5" />}
      {children}
    </div>
  );
}

/* ── Loading skeleton ── */
function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-14">
      <div className="space-y-3">
        <div className="h-3 w-20 ds-skeleton" />
        <div className="h-10 w-2/3 ds-skeleton" />
        <div className="h-px w-full ds-skeleton" />
      </div>
      <div className="mt-12 space-y-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-px w-full ds-skeleton" />
            <div className="h-3 w-16 ds-skeleton" />
            <div className="h-5 w-1/3 ds-skeleton" />
            <div className="h-24 w-full ds-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function ProjectDetail() {
  const searchParams = useSearchParams();
  // Prefer hash fragment (not sent in Referer headers) over query string (legacy)
  const [hashToken, setHashToken] = useState<string | null>(null);
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) setHashToken(hash);
  }, []);
  const token = hashToken || searchParams.get("token");
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
      .catch(() => toast.error("Failed to load project"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProject();

    // Skip polling for completed projects
    const terminalStatuses = ["live", "delivered"];
    let interval: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (interval) return;
      interval = setInterval(() => {
        // Only poll when tab is visible and project isn't in a terminal state
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

  async function handleRevision() {
    if (!token || !revisionMsg.trim()) return;
    setActionLoading(true);
    try {
      await api.approve(token, "revise", revisionMsg);
      setRevisionOpen(false);
      setRevisionMsg("");
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

  const showActions = project.status === "review_ready";
  const cfg = statusConfig[project.status] || statusConfig.intake_received;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-14">
      {/* ── Page header (B3 fix: proper breadcrumb) ── */}
      <div className="kaizen-enter-1">
        {/* Breadcrumb */}
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

        {/* Overline */}
        <p
          className="text-[0.6rem] font-medium uppercase text-muted-foreground/60"
          style={{ letterSpacing: "0.08em" }}
        >
          Project
        </p>

        {/* Company name */}
        <h1
          className="mt-1 text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
          style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
        >
          {project.company_name}
        </h1>

        {/* Metadata row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {tierLabels[project.tier] || project.tier}
          </span>
          <span className="text-xs text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">
            Started {new Date(project.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Decorative rule */}
        <div className="kaizen-enter-fade mt-6 h-px w-full overflow-hidden">
          <div className="kaizen-line h-full bg-border" />
        </div>
      </div>

      {/* ── Content sections ── */}
      <div className="mt-10 space-y-10">
        {/* Visit Your Website card for live projects */}
        {project.status === "live" && project.deliverables?.preview_url && (
          <div className="overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
            <div className="flex items-center gap-5 p-6">
              <div className="hidden shrink-0 overflow-hidden rounded-lg sm:block sm:h-20 sm:w-32">
                <img
                  src={project.deliverables.preview_url}
                  alt={`${project.company_name} preview`}
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-emerald-600 dark:text-emerald-400">
                  Your Website
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {project.deliverables.preview_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </p>
              </div>
              <a
                href={project.deliverables.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-600 transition-colors duration-200 hover:bg-emerald-500/25 dark:text-emerald-400"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </a>
            </div>
          </div>
        )}

        {/* Delivery Timeline (B2 fix: single unified visualization) */}
        <Section label="Progress" title="Delivery Timeline">
          <ProjectDeliveryTimeline
            status={project.status}
            createdAt={project.created_at}
            tier={project.tier}
          />
        </Section>

        {/* Specification */}
        {project.spec_content && (
          <Section label="Documentation" title="Specification">
            <ProjectSpecReader specContent={project.spec_content} />
          </Section>
        )}

        {/* Contract */}
        <Section label="Legal" title="Contract">
          <ProjectContractViewer token={token} />
        </Section>

        {/* Before/After Comparison */}
        {project.original_screenshot_url && project.deliverables?.preview_url && (
          <Section label="Comparison" title="Before / After">
            <ProjectBeforeAfter
              originalUrl={project.original_screenshot_url}
              previewUrl={project.deliverables.preview_url}
            />
          </Section>
        )}

        {/* Preview */}
        <Section label="Deliverable" title="Preview">
          {project.deliverables?.preview_url ? (
            <PreviewFrame url={project.deliverables.preview_url} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border/40 bg-muted/20 py-16 text-center">
              {project.status === "live" ? (
                <>
                  <svg className="mb-4 h-8 w-8 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-muted-foreground">Your website has been delivered. Contact us if you need the preview link updated.</p>
                </>
              ) : (
                <>
                  <svg className="mb-4 h-8 w-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                  <p className="text-sm text-muted-foreground">Preview will appear when your site build is ready</p>
                </>
              )}
            </div>
          )}
        </Section>

        {/* Review actions */}
        {showActions && (
          <Section label="Action Required" title="Review">
            <p className="mb-6 text-sm leading-[1.7] text-muted-foreground">
              Your project is ready for review. Approve to finalize, or request revisions.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="group inline-flex items-center gap-2 text-sm text-foreground transition-all duration-200 disabled:opacity-30"
              >
                <span className="relative">
                  Approve
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-emerald-500" />
                </span>
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => setRevisionOpen(true)}
                disabled={actionLoading}
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground disabled:opacity-30"
              >
                <span className="relative">
                  Request Revision
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-muted-foreground/40 transition-colors duration-200 group-hover:bg-primary" />
                </span>
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          </Section>
        )}

        {/* CMS Onboarding */}
        {project.deliverables?.sanity_studio_url && (
          <Section label="Setup" title="CMS">
            <ProjectCmsOnboarding
              sanityStudioUrl={project.deliverables.sanity_studio_url}
            />
          </Section>
        )}

        {/* Messages */}
        <Section label="Communication" title="Messages">
          <MessageThread
            messages={project.messages || []}
            onSend={handleSendMessage}
          />
        </Section>

        {/* Activity Feed */}
        <Section label="History" title="Activity">
          <ProjectActivityFeed token={token} />
        </Section>

        {/* Deliverables */}
        {project.deliverables?.urls && project.deliverables.urls.length > 0 && (
          <Section label="Files" title="Deliverables">
            <ul className="space-y-3">
              {project.deliverables.urls.map((d, i) => (
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
          </Section>
        )}

        {/* Domain section for live projects */}
        {project.status === "live" && (
          <Section label="Infrastructure" title="Domain">
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
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
                      <p className="text-sm font-medium text-foreground">Connect your domain</p>
                      <p className="text-xs leading-[1.6] text-muted-foreground">
                        Point your domain to your Kaizen site by adding a CNAME record with your DNS provider:
                      </p>
                      <div className="overflow-x-auto rounded-md bg-muted/50 px-3 py-2">
                        <code className="text-xs text-foreground/80">
                          CNAME &rarr; {previewHost}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Changes usually take effect within a few hours.{" "}
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
          </Section>
        )}

        {/* What's Next upsell for delivered projects */}
        {project.status === "live" && (
          <Section label="Opportunity" title="What&apos;s Next?">
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
          </Section>
        )}
      </div>

      {/* Revision dialog */}
      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light tracking-[-0.02em]">Request Revision</DialogTitle>
          </DialogHeader>
          <textarea
            placeholder="What changes would you like?"
            value={revisionMsg}
            onChange={(e) => setRevisionMsg(e.target.value)}
            rows={4}
            className="w-full resize-none border-0 border-b border-border/60 bg-transparent px-0 py-3 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
            style={{ fontFamily: "var(--font-aspekta)" }}
          />
          <DialogFooter>
            <button
              onClick={() => setRevisionOpen(false)}
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleRevision}
              disabled={actionLoading || !revisionMsg.trim()}
              className="group inline-flex items-center gap-2 text-sm text-foreground transition-all duration-200 disabled:opacity-30"
            >
              <span className="relative">
                Submit
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary" />
              </span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
