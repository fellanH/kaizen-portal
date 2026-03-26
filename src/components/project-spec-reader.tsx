"use client";

import { useState, useMemo } from "react";

function parseHeadings(content: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  for (const line of content.split("\n")) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const text = match[2].trim();
      headings.push({
        level: match[1].length,
        text,
        id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      });
    }
  }
  return headings;
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 id="$1" class="text-sm font-medium tracking-tight mt-5 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 id="$1" class="text-base font-light tracking-tight mt-6 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 id="$1" class="text-lg font-light tracking-tight mt-8 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-xs font-normal">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n{2,}/g, '<div class="h-3"></div>')
    .replace(
      /(<h[123][^>]*>)/g,
      (match) => {
        const textMatch = match.match(/id="([^"]+)"/);
        if (textMatch) {
          const id = textMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return match.replace(/id="[^"]*"/, `id="${id}"`);
        }
        return match;
      }
    );
}

export function ProjectSpecReader({ specContent }: { specContent: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showToc, setShowToc] = useState(false);

  const headings = useMemo(() => parseHeadings(specContent), [specContent]);
  const renderedHtml = useMemo(() => renderMarkdown(specContent), [specContent]);

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Project Specification</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; font-size: 14px; }
        h1 { font-size: 1.5em; font-weight: 300; margin-top: 1.5em; } h2 { font-size: 1.25em; font-weight: 300; margin-top: 1.25em; } h3 { font-size: 1.1em; margin-top: 1em; }
        code { background: #f3f4f6; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.9em; }
        li { margin-left: 1.5em; }
        @media print { body { margin: 0; } }
      </style></head>
      <body>${renderedHtml}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="group inline-flex items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <span className="relative">
            {expanded ? "Collapse" : "View full spec"}
            <span className="absolute inset-x-0 -bottom-px h-px bg-primary/40 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
          </span>
        </button>
        {expanded && headings.length > 2 && (
          <button
            onClick={() => setShowToc(!showToc)}
            className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            {showToc ? "Hide contents" : "Contents"}
          </button>
        )}
        {expanded && (
          <button
            onClick={handlePrint}
            className="ml-auto text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Print / PDF
          </button>
        )}
      </div>

      {expanded && (
        <div className="spec-reader-enter flex gap-5">
          {/* Table of Contents sidebar */}
          {showToc && headings.length > 0 && (
            <nav className="hidden w-48 shrink-0 md:block">
              <div className="sticky top-0 max-h-96 space-y-1.5 overflow-y-auto border-r border-border/60 pr-4">
                <p className="mb-3 text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
                  Contents
                </p>
                {headings.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    className="block text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            </nav>
          )}

          {/* Spec content */}
          <div
            className="prose prose-sm max-w-none flex-1 text-sm leading-[1.7]"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      )}
    </div>
  );
}
