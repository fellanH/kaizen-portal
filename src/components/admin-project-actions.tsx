"use client";

import { useState } from "react";

const API_BASE = "https://kaizen-intake-api.fehellstrom.workers.dev";

interface AdminProjectActionsProps {
  token: string;
  status: string;
  previewUrl?: string;
}

export function AdminProjectActions({ token, status, previewUrl }: AdminProjectActionsProps) {
  const [loading, setLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState<"approved" | "revised" | null>(null);

  async function handleApprove() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "",
        },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!res.ok) throw new Error("Failed");
      setResult("approved");
    } catch {
      alert("Failed to approve project");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevise() {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "",
        },
        body: JSON.stringify({ status: "revision", feedback: feedback.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setResult("revised");
      setFeedbackOpen(false);
      setFeedback("");
    } catch {
      alert("Failed to submit revision");
    } finally {
      setLoading(false);
    }
  }

  if (result === "approved") {
    return <span className="text-xs text-emerald-400">Approved</span>;
  }
  if (result === "revised") {
    return <span className="text-xs text-yellow-400">Revision sent</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {previewUrl && (
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-xs"
        >
          Preview
        </a>
      )}
      {status === "review_ready" && (
        <>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
          >
            Approve
          </button>
          {!feedbackOpen ? (
            <button
              onClick={() => setFeedbackOpen(true)}
              disabled={loading}
              className="text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-40"
            >
              Revise
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Feedback..."
                className="w-40 border-b border-foreground/20 bg-transparent px-1 py-0.5 text-xs text-foreground outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRevise();
                  if (e.key === "Escape") { setFeedbackOpen(false); setFeedback(""); }
                }}
                autoFocus
              />
              <button
                onClick={handleRevise}
                disabled={loading || !feedback.trim()}
                className="text-xs text-primary hover:text-primary/80 disabled:opacity-40"
              >
                Send
              </button>
              <button
                onClick={() => { setFeedbackOpen(false); setFeedback(""); }}
                className="text-xs text-foreground/40 hover:text-foreground/60"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
      {status !== "review_ready" && !previewUrl && (
        <span className="text-foreground/20 text-xs">No preview</span>
      )}
    </div>
  );
}
