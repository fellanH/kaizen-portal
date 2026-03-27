"use client";

import { useEffect, useState } from "react";
import { api, type ContractResponse } from "@/lib/api";
import { toast } from "sonner";

export function ProjectContractViewer({ token }: { token: string }) {
  const [data, setData] = useState<ContractResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setError(false);
    api
      .getContract(token)
      .then(setData)
      .catch(() => {
        setError(true);
        toast.error("Failed to load contract");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    try {
      await api.approve(token, "accept_contract");
      const updated = await api.getContract(token);
      setData(updated);
    } finally {
      setAccepting(false);
    }
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function handlePrint() {
    if (!data) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const sectionsHtml = data.contract.sections
      .map((s) => `<h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.content)}</p>`)
      .join("");
    const company = escapeHtml(data.contract.company);
    const tier = escapeHtml(data.contract.tier);
    const createdAt = new Date(data.contract.created_at).toLocaleDateString();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Contract: ${company}</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 700px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; font-size: 14px; }
        h1 { font-size: 1.3em; border-bottom: 2px solid #e85325; padding-bottom: 0.5em; }
        h2 { font-size: 1.1em; margin-top: 1.5em; color: #374151; }
        .meta { color: #6b7280; font-size: 0.85em; margin-bottom: 2em; }
        .accepted { margin-top: 2em; padding: 1em; background: #f0fdf4; border-radius: 8px; color: #166534; }
      </style></head><body>
        <h1>Project Agreement</h1>
        <div class="meta">
          <p>${company} | ${tier} tier | ${createdAt}</p>
        </div>
        ${sectionsHtml}
        ${data.accepted ? `<div class="accepted">Contract accepted on ${new Date(data.accepted_at!).toLocaleDateString()}</div>` : ""}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-1/3 ds-skeleton" />
        <div className="h-20 w-full ds-skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
        <p className="flex-1 text-sm text-muted-foreground">Failed to load contract.</p>
        <button
          onClick={() => { setLoading(true); setError(false); api.getContract(token).then(setData).catch(() => { setError(true); toast.error("Failed to load contract"); }).finally(() => setLoading(false)); }}
          className="text-xs text-primary transition-colors duration-200 hover:text-primary/80"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              data.accepted
                ? "status-emerald"
                : "status-neutral"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${data.accepted ? "bg-emerald-500" : "bg-muted-foreground/60"}`} />
            {data.accepted ? "Accepted" : "Pending"}
          </span>
          {data.accepted && data.accepted_at && (
            <span className="text-xs text-muted-foreground">
              {new Date(data.accepted_at).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* B4 fix: only show Download PDF for accepted contracts */}
          {data.accepted && (
            <button
              onClick={handlePrint}
              className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <span className="relative">
                Download PDF
                <span className="absolute inset-x-0 -bottom-px h-px bg-primary/40 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
              </span>
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <span className="relative">
              {expanded ? "Collapse" : "View contract"}
              <span className="absolute inset-x-0 -bottom-px h-px bg-primary/40 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
            </span>
          </button>
        </div>
      </div>

      {/* Contract sections */}
      {expanded && (
        <div className="contract-enter space-y-5 rounded-lg border border-border/60 bg-card p-6">
          <div className="border-b border-border/60 pb-4">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
              Agreement
            </p>
            <h3 className="mt-1 text-base font-light tracking-[-0.02em]">
              Project Agreement
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.contract.company} · {data.contract.tier} tier ·{" "}
              {new Date(data.contract.created_at).toLocaleDateString()}
            </p>
          </div>

          {data.contract.sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-sm font-medium tracking-[-0.01em]">{section.title}</h4>
              <p className="mt-1.5 text-sm leading-[1.7] text-muted-foreground">
                {section.content}
              </p>
            </div>
          ))}

          {/* Accept button */}
          {!data.accepted && (
            <div className="border-t border-border/60 pt-5">
              <p className="mb-4 text-xs text-muted-foreground">
                By clicking below, you agree to the terms outlined above.
              </p>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="group inline-flex items-center gap-2 text-sm text-foreground transition-all duration-200 disabled:opacity-30"
              >
                <span className="relative">
                  {accepting ? "Accepting..." : "I Accept"}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary" />
                </span>
                {!accepting && (
                  <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
