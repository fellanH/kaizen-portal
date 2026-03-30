"use client";

import { cn } from "@/lib/utils";

interface SitePage {
  id: string;
  title: string;
  path: string;
  sectionCount?: number;
}

interface PagesPanelProps {
  siteModel: unknown;
  previewUrl: string | null;
  onNavigate: (path: string) => void;
}

function extractPages(siteModel: unknown): SitePage[] {
  if (!siteModel || typeof siteModel !== "object") return [];
  const m = siteModel as Record<string, unknown>;

  if (Array.isArray(m.pages)) {
    return (m.pages as unknown[]).map((p, i) => {
      if (typeof p === "object" && p !== null) {
        const pg = p as Record<string, unknown>;
        return {
          id: String(pg.id ?? i),
          title: String(pg.title ?? `Page ${i + 1}`),
          path: String(pg.path ?? "/"),
          sectionCount:
            typeof pg.sectionCount === "number" ? pg.sectionCount : undefined,
        };
      }
      return { id: String(i), title: String(p), path: "/" };
    });
  }

  return [];
}

export function PagesPanel({ siteModel, previewUrl, onNavigate }: PagesPanelProps) {
  const pages = extractPages(siteModel);

  if (pages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <p
          className="text-center text-xs font-light"
          style={{ color: "#a3a3a3" }}
        >
          Page list will appear here once generation is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
      <p
        className="text-[10px] font-medium uppercase tracking-widest"
        style={{ color: "#a3a3a3" }}
      >
        Pages ({pages.length})
      </p>

      <div className="flex flex-col gap-1">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onNavigate(page.path)}
            disabled={!previewUrl}
            className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors",
              "hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            style={{ borderColor: "#262626", backgroundColor: "#1c1c1c" }}
          >
            <div className="flex flex-col gap-0.5">
              <span
                className="text-xs font-light"
                style={{ color: "#fafaf9" }}
              >
                {page.title}
              </span>
              <span
                className="font-mono text-[10px]"
                style={{ color: "#a3a3a3" }}
              >
                {page.path}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {typeof page.sectionCount === "number" && (
                <span
                  className="text-[10px] font-light"
                  style={{ color: "#a3a3a3" }}
                >
                  {page.sectionCount} section{page.sectionCount !== 1 ? "s" : ""}
                </span>
              )}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{ color: "#a3a3a3", opacity: 0.5 }}
              >
                <path
                  d="M4.5 2.5L8 6l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <p
        className="text-center text-[10px] font-light"
        style={{ color: "#a3a3a3", opacity: 0.4 }}
      >
        Section management available in a future update.
      </p>
    </div>
  );
}
