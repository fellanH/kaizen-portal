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

const cardConfig: Record<
  string,
  { accent: string; border: string; bg: string; heading: string; body: string }
> = {
  intake_received: {
    accent: "border-l-muted-foreground/40",
    border: "border-border/60",
    bg: "bg-muted/20",
    heading: "We've received your request",
    body: "Your project is being reviewed. We'll start scoping within 24 hours.",
  },
  spec_writing: {
    accent: "border-l-amber-500",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.04]",
    heading: "Your project is being scoped",
    body: "We're writing the specification for your site. You'll be able to review it soon.",
  },
  building: {
    accent: "border-l-blue-500",
    border: "border-blue-500/20",
    bg: "bg-blue-500/[0.04]",
    heading: "Your site is being built",
    body: "Development is underway. You can preview progress below.",
  },
  review_ready: {
    accent: "border-l-primary",
    border: "border-primary/20",
    bg: "bg-primary/[0.04]",
    heading: "Your site is ready for review",
    body: "Review the preview below and let us know if it's what you had in mind.",
  },
  live: {
    accent: "border-l-emerald-500",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.04]",
    heading: "Your website is live",
    body: "",
  },
};

export function ProjectPrimaryAction({
  project,
  token,
  onApprove,
  onRevise,
  actionLoading,
}: PrimaryActionProps) {
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMsg, setRevisionMsg] = useState("");

  const cfg = cardConfig[project.status] || cardConfig.intake_received;
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
        className={`overflow-hidden rounded-xl border ${cfg.border} ${cfg.bg} border-l-4 ${cfg.accent}`}
      >
        <div className="p-5 sm:p-6">
          <p className="text-sm font-medium text-foreground">{cfg.heading}</p>

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
              {cfg.body}
            </p>
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
