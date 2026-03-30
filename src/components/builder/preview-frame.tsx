"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SectionAction {
  action: "swap" | "edit" | "move_up" | "move_down" | "delete" | "content_updated";
  sectionIndex: number;
  sectionType?: string;
  updates?: Record<string, string>;
}

interface PreviewFrameProps {
  previewUrl: string | null;
  isMobile: boolean;
  onToggleMobile: () => void;
  /** Called with a resolved URL string to imperatively navigate the iframe */
  navigateRef?: React.MutableRefObject<((path: string) => void) | null>;
  onSectionAction?: (action: SectionAction) => void;
  /** When this value changes, the iframe src is reloaded */
  refreshKey?: number;
  className?: string;
}

export function PreviewFrame({
  previewUrl,
  isMobile,
  onToggleMobile,
  navigateRef,
  onSectionAction,
  refreshKey,
  className,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  // Re-load iframe when refreshKey changes (triggered by section_updated WS messages)
  const prevRefreshKey = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (refreshKey === undefined) return;
    if (prevRefreshKey.current === undefined) {
      prevRefreshKey.current = refreshKey;
      return;
    }
    if (refreshKey !== prevRefreshKey.current) {
      prevRefreshKey.current = refreshKey;
      handleRefresh();
    }
  }, [refreshKey, handleRefresh]);

  const navigateTo = useCallback(
    (path: string) => {
      if (!previewUrl) return;
      try {
        const base = new URL(previewUrl);
        const next = new URL(path, base.origin);
        if (iframeRef.current) {
          iframeRef.current.src = next.toString();
        }
      } catch {
        if (iframeRef.current) {
          iframeRef.current.src = path;
        }
      }
    },
    [previewUrl]
  );

  // Wire navigateTo into the ref so EditorShell can call it imperatively.
  useEffect(() => {
    if (navigateRef) {
      navigateRef.current = navigateTo;
    }
  }, [navigateRef, navigateTo]);

  // Listen for postMessage events from the overlay SDK running inside the iframe.
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || event.data.source !== "kaizen-overlay") return;
      if (!onSectionAction) return;

      const { action, sectionIndex, sectionType, updates } = event.data as {
        source: string;
        action: SectionAction["action"];
        sectionIndex: number;
        sectionType?: string;
        updates?: Record<string, string>;
      };

      if (typeof action !== "string" || typeof sectionIndex !== "number") return;

      onSectionAction({ action, sectionIndex, sectionType, updates });
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSectionAction]);

  /** Send a message to the overlay SDK running inside the iframe. */
  const postToIframe = useCallback((data: Record<string, unknown>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(data, "*");
    }
  }, []);

  // Expose postToIframe via a data attribute so parent can call it if needed.
  // (Stored on the iframe element as a convenience; callers should use the ref instead.)
  void postToIframe;

  return (
    <div
      className={cn("flex flex-col bg-[#0a0a0a]", className)}
      style={{ minWidth: 0 }}
    >
      {/* Toolbar */}
      <div
        className="flex h-9 shrink-0 items-center gap-2 border-b px-3"
        style={{ borderColor: "#262626", backgroundColor: "#141414" }}
      >
        {/* URL bar */}
        <div
          className="flex flex-1 items-center gap-2 overflow-hidden rounded px-2.5 py-1"
          style={{ backgroundColor: "#1c1c1c" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{ color: "#a3a3a3", flexShrink: 0 }}
          >
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M6 1C6 1 4 3.5 4 6s2 5 2 5M6 1c0 0 2 2.5 2 5s-2 5-2 5M1 6h10"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span
            className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-light"
            style={{ color: "#a3a3a3" }}
          >
            {previewUrl ?? "Waiting for preview..."}
          </span>
        </div>

        {/* Toggle desktop / mobile */}
        <button
          onClick={onToggleMobile}
          title={isMobile ? "Switch to desktop" : "Switch to mobile"}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/5"
          style={{ color: isMobile ? "#e85325" : "#a3a3a3" }}
        >
          {isMobile ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="4"
                y="1"
                width="6"
                height="12"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="7" cy="10.5" r="0.75" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="1"
                y="2.5"
                width="12"
                height="8"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M5 11.5h4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          title="Refresh preview"
          disabled={!previewUrl}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/5 disabled:opacity-30"
          style={{ color: "#a3a3a3" }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M11.5 6.5A5 5 0 1 1 6.5 1.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M7.5 1l2 2-2 2"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Frame area */}
      <div className="flex flex-1 items-start justify-center overflow-auto p-0">
        {previewUrl ? (
          <div
            className={cn(
              "relative h-full overflow-hidden transition-all duration-300",
              isMobile ? "mx-auto w-[375px] rounded-lg shadow-2xl" : "w-full"
            )}
            style={isMobile ? { maxHeight: "100%" } : {}}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="h-full w-full border-0"
              title="Site preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p
              className="text-xs font-light"
              style={{ color: "#a3a3a3" }}
            >
              Preview will appear here when generation is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
