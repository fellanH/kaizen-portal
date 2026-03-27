"use client";

import { useState } from "react";
import { type Project } from "@/lib/api";
import { ExternalLink, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PrimaryActionProps {
  project: Project;
  token: string;
  onApprove: () => Promise<void>;
  onRevise: (message: string) => Promise<void>;
  actionLoading: boolean;
}

const cardStyle: Record<
  string,
  { accent: string; border: string; bg: string }
> = {
  intake_received: {
    accent: "border-l-muted-foreground/40",
    border: "border-border/60",
    bg: "bg-muted/20",
  },
  spec_writing: {
    accent: "border-l-amber-500",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.04]",
  },
  building: {
    accent: "border-l-blue-500",
    border: "border-blue-500/20",
    bg: "bg-blue-500/[0.04]",
  },
  review_ready: {
    accent: "border-l-primary",
    border: "border-primary/20",
    bg: "bg-primary/[0.04]",
  },
  approved: {
    accent: "border-l-emerald-500",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.04]",
  },
  revising: {
    accent: "border-l-amber-500",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.04]",
  },
  live: {
    accent: "border-l-emerald-500",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.04]",
  },
};

function getCardContent(project: Project): { heading: string; body: string } {
  const previewUrl = project.deliverables?.preview_url;
  const website = (project as unknown as Record<string, unknown>).website as string | undefined;

  switch (project.status) {
    case "intake_received":
      if (project.spec_content) {
        return {
          heading: "Your project specification is ready",
          body: "We've analyzed your requirements and prepared a detailed specification for your review.",
        };
      }
      if (website) {
        return {
          heading: `We're analyzing ${website}`,
          body: "Your project specification will be ready soon.",
        };
      }
      return {
        heading: "We've received your request",
        body: "Your project is being reviewed. We'll start scoping within 24 hours.",
      };
    case "spec_writing":
      return {
        heading: "Your project is being scoped",
        body: "We're writing the specification for your site. You'll be able to review it soon.",
      };
    case "building":
      if (previewUrl) {
        return {
          heading: "Your site is being built",
          body: "Development is underway based on your approved specification.",
        };
      }
      return {
        heading: "Your site is being built",
        body: "Development is underway based on your approved specification. We'll notify you when the preview is ready.",
      };
    case "review_ready":
      return {
        heading: "Your site is ready for review",
        body: "Review the preview below and let us know if it's what you had in mind.",
      };
    case "approved":
      return {
        heading: "Your site is approved",
        body: "We're preparing your site for launch.",
      };
    case "revising":
      return {
        heading: "We're working on your revisions",
        body: "Your feedback has been received. We'll have an updated preview ready soon.",
      };
    case "live":
      return { heading: "Your website is live", body: "" };
    default:
      return {
        heading: "We've received your request",
        body: "Your project is being reviewed. We'll start scoping within 24 hours.",
      };
  }
}

export function ProjectPrimaryAction({
  project,
  token,
  onApprove,
  onRevise,
  actionLoading,
}: PrimaryActionProps) {
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMsg, setRevisionMsg] = useState("");

  const style = cardStyle[project.status] || cardStyle.intake_received;
  const content = getCardContent(project);
  const previewUrl = project.deliverables?.preview_url;

  async function handleRevision() {
    if (!revisionMsg.trim()) return;
    try {
      await onRevise(revisionMsg);
      setRevisionOpen(false);
      setRevisionMsg("");
    } catch {
      // parent handles toast
    }
  }

  return (
    <>
      <div
        className={`overflow-hidden rounded-xl border ${style.border} ${style.bg} border-l-4 ${style.accent}`}
      >
        <div className="p-5 sm:p-6">
          <p className="text-sm font-medium text-foreground">{content.heading}</p>

          {/* Body text or live URL */}
          {project.status === "live" && previewUrl ? (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="truncate text-sm text-muted-foreground">
                {previewUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </p>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors duration-200 hover:bg-emerald-500/25 dark:text-emerald-400"
              >
                <ExternalLink className="h-3 w-3" />
                Visit Your Website
              </a>
            </div>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {content.body}
            </p>
          )}

          {/* View Specification button for intake_received with spec ready */}
          {project.status === "intake_received" && project.spec_content && (
            <a
              href="#specification"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-foreground transition-colors duration-200 hover:text-primary"
            >
              <span className="relative">
                View Specification
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary" />
              </span>
            </a>
          )}

          {/* Spec link for spec_writing */}
          {project.status === "spec_writing" && project.spec_content && (
            <a
              href="#specification"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-600 transition-colors duration-200 hover:text-amber-500 dark:text-amber-400"
            >
              View Spec
            </a>
          )}

          {/* Preview link for building */}
          {project.status === "building" && previewUrl && (
            <a
              href="#preview"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 transition-colors duration-200 hover:text-blue-500 dark:text-blue-400"
            >
              View Preview
            </a>
          )}

          {/* Preview URL prominently in review_ready card */}
          {project.status === "review_ready" && previewUrl && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary transition-colors duration-200 hover:text-primary/80"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="relative">
                  {previewUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary/40" />
                </span>
              </a>
            </div>
          )}

          {/* Approve / Revise for review_ready */}
          {project.status === "review_ready" && (
            <div className="mt-4 flex items-center gap-6">
              <button
                onClick={onApprove}
                disabled={actionLoading}
                className="group inline-flex items-center gap-2 text-sm text-foreground transition-all duration-200 disabled:opacity-30"
              >
                <span className="relative">
                  Approve
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-emerald-500" />
                </span>
                <svg
                  className="h-3.5 w-3.5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => setRevisionOpen(true)}
                disabled={actionLoading}
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground disabled:opacity-30"
              >
                <span className="relative">
                  Request Changes
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-muted-foreground/40 transition-colors duration-200 group-hover:bg-primary" />
                </span>
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Revision dialog */}
      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-light tracking-[-0.02em]">
              Request Revision
            </DialogTitle>
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
    </>
  );
}
