"use client";

import { useState, useEffect, useCallback } from "react";

export interface TemplateData {
  id: string;
  category: string;
  html: string;
}

interface CategoryGroup {
  name: string;
  templates: TemplateData[];
}

type ReviewStatus = "unreviewed" | "approved" | "revision";

interface ReviewEntry {
  status: ReviewStatus;
  notes: string;
}

type ReviewState = Record<string, ReviewEntry>;

const STORAGE_KEY = "kaizen-section-review";

function loadReviewState(): ReviewState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveReviewState(state: ReviewState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-400">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4.5 7L6.2 8.7L9.5 5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Approved
      </span>
    );
  }
  if (status === "revision") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-400">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 4.5V7.5M7 9.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Needs Revision
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-foreground/30">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      Unreviewed
    </span>
  );
}

function TemplateCard({
  template,
  css,
  review,
  onStatusChange,
  onNotesChange,
}: {
  template: TemplateData;
  css: string;
  review: ReviewEntry;
  onStatusChange: (status: ReviewStatus) => void;
  onNotesChange: (notes: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const iframeSrcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
${css}
body { background: #faf9f7; overflow: hidden; font-family: 'Inter', sans-serif; }
.reveal, .reveal-stagger, .img-reveal { opacity: 1 !important; transform: none !important; }
</style>
</head>
<body>${template.html}</body>
</html>`;

  const statusCycle: ReviewStatus[] = ["unreviewed", "approved", "revision"];

  return (
    <div className={`border rounded-lg overflow-hidden bg-foreground/[0.01] transition-colors ${
      review.status === "approved" ? "border-green-500/30" :
      review.status === "revision" ? "border-orange-500/30" :
      "border-foreground/10 hover:border-foreground/20"
    }`}>
      {/* Preview iframe */}
      <div className={`bg-white overflow-hidden transition-all duration-300 ${expanded ? "h-[500px]" : "h-40"}`}>
        <iframe
          srcDoc={iframeSrcDoc}
          className="w-full border-0"
          style={{ height: expanded ? "500px" : "600px", transform: expanded ? "none" : "scale(0.35)", transformOrigin: "top left", width: expanded ? "100%" : "285.7%" }}
          sandbox="allow-scripts"
          title={`Preview of ${template.id}`}
        />
      </div>

      {/* Info + controls */}
      <div className="px-3 py-2.5 border-t border-foreground/10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="font-mono text-xs text-foreground/80 font-medium">{template.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={review.status} />
            <div className="flex items-center gap-0.5">
              {statusCycle.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    review.status === s
                      ? s === "approved" ? "bg-green-500/20 text-green-400"
                        : s === "revision" ? "bg-orange-500/20 text-orange-400"
                        : "bg-foreground/10 text-foreground/60"
                      : "text-foreground/20 hover:text-foreground/40"
                  }`}
                  title={s === "unreviewed" ? "Mark unreviewed" : s === "approved" ? "Approve" : "Needs revision"}
                >
                  {s === "unreviewed" ? "?" : s === "approved" ? "\u2713" : "!"}
                </button>
              ))}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-foreground/30 hover:text-foreground/60 transition-colors ml-1"
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>

        {/* Notes field: visible when "revision" */}
        {review.status === "revision" && (
          <textarea
            value={review.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="What needs to change?"
            rows={2}
            className="w-full bg-foreground/5 border border-foreground/10 rounded px-2 py-1.5 text-xs text-foreground/80 placeholder:text-foreground/25 outline-none focus:border-orange-500/40 resize-none"
          />
        )}
      </div>
    </div>
  );
}

export function SectionsClient({
  categories,
  css,
  totalCount,
}: {
  categories: CategoryGroup[];
  css: string;
  totalCount: number;
}) {
  const [filter, setFilter] = useState("");
  const [reviews, setReviews] = useState<ReviewState>({});
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setReviews(loadReviewState());
  }, []);

  const updateReview = useCallback((id: string, patch: Partial<ReviewEntry>) => {
    setReviews((prev) => {
      const current = prev[id] || { status: "unreviewed", notes: "" };
      const next = { ...prev, [id]: { ...current, ...patch } };
      saveReviewState(next);
      return next;
    });
  }, []);

  const getReview = (id: string): ReviewEntry => reviews[id] || { status: "unreviewed", notes: "" };

  // Filter
  const filtered = filter
    ? categories
        .map((cat) => ({
          ...cat,
          templates: cat.templates.filter(
            (t) =>
              t.id.toLowerCase().includes(filter.toLowerCase()) ||
              cat.name.toLowerCase().includes(filter.toLowerCase())
          ),
        }))
        .filter((cat) => cat.templates.length > 0)
    : categories;

  const filteredCount = filtered.reduce((sum, cat) => sum + cat.templates.length, 0);

  // Review counts
  const revisionSections = Object.entries(reviews).filter(([, r]) => r.status === "revision");
  const approvedCount = Object.values(reviews).filter((r) => r.status === "approved").length;

  const handleSubmitReview = async () => {
    const sections = revisionSections.map(([id, r]) => {
      const cat = categories.find((c) => c.templates.some((t) => t.id === id));
      return { id, category: cat?.name || "Unknown", notes: r.notes };
    });

    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:4444/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "section-review", sections }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast(`Review submitted: ${sections.length} section${sections.length !== 1 ? "s" : ""} flagged`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast(`Submit failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-foreground">
            Section Catalog
          </h1>
          <p className="text-sm text-foreground/40 mt-1">
            {totalCount} templates across {categories.length} categories
            {approvedCount > 0 && (
              <span className="text-green-400 ml-2">
                {approvedCount} approved
              </span>
            )}
            {revisionSections.length > 0 && (
              <span className="text-orange-400 ml-2">
                {revisionSections.length} need revision
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter sections..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-0 border-b border-foreground/20 bg-transparent px-0 py-1.5 text-sm text-foreground outline-none transition-colors duration-300 focus:border-primary/60 w-48 placeholder:text-foreground/30"
          />
          {filter && (
            <span className="text-[11px] text-foreground/40 border border-foreground/20 rounded px-2 py-0.5">
              {filteredCount} match{filteredCount !== 1 ? "es" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Category groups */}
      {filtered.map((category) => (
        <div key={category.name} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-foreground/60 uppercase tracking-wider">
              {category.name}
            </h2>
            <span className="text-[10px] text-foreground/30 border border-foreground/10 rounded px-1.5 py-0.5">
              {category.templates.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {category.templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                css={css}
                review={getReview(template.id)}
                onStatusChange={(status) => updateReview(template.id, { status })}
                onNotesChange={(notes) => updateReview(template.id, { notes })}
              />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="py-20 text-center text-foreground/30 text-sm">
          No sections match &quot;{filter}&quot;
        </div>
      )}

      {/* Sticky review bar */}
      {revisionSections.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-foreground/10 px-6 py-3 flex items-center justify-between z-50">
          <span className="text-sm text-orange-400">
            {revisionSections.length} section{revisionSections.length !== 1 ? "s" : ""} need revision
          </span>
          <button
            onClick={handleSubmitReview}
            disabled={submitting}
            className="px-4 py-1.5 bg-foreground/90 text-background text-sm rounded hover:bg-foreground transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-foreground/90 text-background text-sm px-4 py-2.5 rounded shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}
    </div>
  );
}
