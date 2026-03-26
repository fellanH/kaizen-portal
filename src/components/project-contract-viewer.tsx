"use client";

import { useEffect, useState } from "react";
import { api, type ContractResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectContractViewer({ token }: { token: string }) {
  const [data, setData] = useState<ContractResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api
      .getContract(token)
      .then(setData)
      .catch(() => {})
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

  function handlePrint() {
    if (!data) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const sectionsHtml = data.contract.sections
      .map((s) => `<h2>${s.title}</h2><p>${s.content}</p>`)
      .join("");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Contract: ${data.contract.company}</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 700px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; font-size: 14px; }
        h1 { font-size: 1.3em; border-bottom: 2px solid #e85325; padding-bottom: 0.5em; }
        h2 { font-size: 1.1em; margin-top: 1.5em; color: #374151; }
        .meta { color: #6b7280; font-size: 0.85em; margin-bottom: 2em; }
        .accepted { margin-top: 2em; padding: 1em; background: #f0fdf4; border-radius: 8px; color: #166534; }
      </style></head><body>
        <h1>Project Agreement</h1>
        <div class="meta">
          <p>${data.contract.company} | ${data.contract.tier} tier | ${new Date(data.contract.created_at).toLocaleDateString()}</p>
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
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={data.accepted ? "default" : "secondary"}
            className={data.accepted ? "bg-green-600 text-white" : ""}
          >
            {data.accepted ? "Accepted" : "Pending"}
          </Badge>
          {data.accepted && data.accepted_at && (
            <span className="text-xs text-muted-foreground">
              {new Date(data.accepted_at).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrint} className="text-xs">
            Download PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? "Collapse" : "View"}
          </Button>
        </div>
      </div>

      {/* Contract sections */}
      {expanded && (
        <div className="contract-enter space-y-4 rounded-lg border bg-card p-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-semibold">Project Agreement</h3>
            <p className="text-xs text-muted-foreground">
              {data.contract.company} | {data.contract.tier} tier |{" "}
              {new Date(data.contract.created_at).toLocaleDateString()}
            </p>
          </div>

          {data.contract.sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-sm font-medium">{section.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            </div>
          ))}

          {/* Accept button */}
          {!data.accepted && (
            <div className="border-t pt-4">
              <p className="mb-3 text-xs text-muted-foreground">
                By clicking "I Accept", you agree to the terms outlined above.
              </p>
              <Button onClick={handleAccept} disabled={accepting} size="sm">
                {accepting ? "Accepting..." : "I Accept"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
