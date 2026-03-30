"use client";

import { useRef, useState, useCallback } from "react";
import { PreviewFrame, SectionAction } from "./preview-frame";
import { ChatPanel } from "./chat-panel";
import { StylePanel } from "./style-panel";
import { PagesPanel } from "./pages-panel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface EditorShellProps {
  projectId: string;
  previewUrl: string | null;
  siteModel: unknown;
  sendMessage: (data: Record<string, unknown>) => void;
  lastChatResponse: string | null;
  refreshKey?: number;
}

const MIN_PANEL_WIDTH = 280;
const DEFAULT_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 560;

export function EditorShell({
  projectId,
  previewUrl,
  siteModel,
  sendMessage,
  lastChatResponse,
  refreshKey,
}: EditorShellProps) {
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigateRef = useRef<((path: string) => void) | null>(null);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = panelWidth;

      const onMove = (ev: MouseEvent) => {
        const delta = startX - ev.clientX;
        const next = Math.max(
          MIN_PANEL_WIDTH,
          Math.min(MAX_PANEL_WIDTH, startWidth + delta)
        );
        setPanelWidth(next);
      };

      const onUp = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [panelWidth]
  );

  const handleNavigate = useCallback((path: string) => {
    navigateRef.current?.(path);
  }, []);

  /**
   * Handle section actions forwarded from the overlay SDK running in the iframe.
   * Translates them into WS messages consumed by the BuilderAgent.
   */
  const handleSectionAction = useCallback(
    (action: SectionAction) => {
      const { action: op, sectionIndex, sectionType, updates } = action;
      const pageIndex = activePageIndex;

      switch (op) {
        case "swap":
          sendMessage({
            type: "section_op",
            action: "swap_section",
            pageIndex,
            sectionIndex,
            currentType: sectionType ?? "",
          });
          break;

        case "move_up":
          if (sectionIndex === 0) return;
          sendMessage({
            type: "section_op",
            action: "reorder_sections",
            pageIndex,
            swapA: sectionIndex - 1,
            swapB: sectionIndex,
          });
          break;

        case "move_down":
          sendMessage({
            type: "section_op",
            action: "reorder_sections",
            pageIndex,
            swapA: sectionIndex,
            swapB: sectionIndex + 1,
          });
          break;

        case "delete": {
          const confirmed = window.confirm(
            `Remove section ${sectionIndex + 1}${sectionType ? ` (${sectionType})` : ""}? This cannot be undone.`
          );
          if (!confirmed) return;
          sendMessage({
            type: "section_op",
            action: "remove_section",
            pageIndex,
            sectionIndex,
          });
          break;
        }

        case "content_updated":
          if (updates) {
            Object.entries(updates).forEach(([field, value]) => {
              sendMessage({
                type: "section_op",
                action: "update_content",
                pageIndex,
                sectionIndex,
                field,
                value,
              });
            });
          }
          break;

        case "edit":
          // Placeholder: in a future iteration this could open an inline editor.
          break;
      }
    },
    [activePageIndex, sendMessage]
  );

  // Track which page is active based on navigation (for section action routing).
  const handleNavigateWithTracking = useCallback(
    (path: string) => {
      handleNavigate(path);

      // Try to infer the page index from the path by matching against siteModel.
      if (siteModel && typeof siteModel === "object") {
        const m = siteModel as Record<string, unknown>;
        if (Array.isArray(m.pages)) {
          const pages = m.pages as Array<Record<string, unknown>>;
          const slug = path.replace(/^\//, "") || "index";
          const idx = pages.findIndex(
            (p) => p.slug === slug || (slug === "index" && (!p.slug || p.slug === "/"))
          );
          if (idx >= 0) setActivePageIndex(idx);
        }
      }
    },
    [handleNavigate, siteModel]
  );

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden"
      style={{ cursor: isResizing ? "col-resize" : "default" }}
    >
      {/* Preview pane */}
      <PreviewFrame
        previewUrl={previewUrl}
        isMobile={isMobilePreview}
        onToggleMobile={() => setIsMobilePreview((p) => !p)}
        navigateRef={navigateRef}
        onSectionAction={handleSectionAction}
        refreshKey={refreshKey}
        className="flex-1"
      />

      {/* Drag handle */}
      <div
        onMouseDown={handleDragStart}
        className="relative z-10 flex w-1 shrink-0 cursor-col-resize items-center justify-center transition-colors hover:bg-[#e85325]/40"
        style={{
          backgroundColor: isResizing ? "#e85325" : "#262626",
          transition: isResizing ? "none" : "background-color 0.15s",
        }}
      >
        <div
          className="absolute h-10 w-3"
          style={{ cursor: "col-resize" }}
        />
      </div>

      {/* Control panel */}
      <div
        className="flex shrink-0 flex-col border-l"
        style={{
          width: panelWidth,
          borderColor: "#262626",
          backgroundColor: "#141414",
        }}
      >
        <ControlPanel
          siteModel={siteModel}
          previewUrl={previewUrl}
          sendMessage={sendMessage}
          lastChatResponse={lastChatResponse}
          onNavigate={handleNavigateWithTracking}
        />
      </div>
    </div>
  );
}

// ----- Control Panel (tabbed) -----

function ControlPanel({
  siteModel,
  previewUrl,
  sendMessage,
  lastChatResponse,
  onNavigate,
}: {
  siteModel: unknown;
  previewUrl: string | null;
  sendMessage: (data: Record<string, unknown>) => void;
  lastChatResponse: string | null;
  onNavigate: (path: string) => void;
}) {
  return (
    <Tabs defaultValue="chat" className="flex h-full flex-col">
      {/* Tab bar */}
      <div
        className="shrink-0 border-b px-3 pt-2 pb-0"
        style={{ borderColor: "#262626" }}
      >
        <TabsList
          variant="line"
          className="w-full justify-start gap-0 rounded-none bg-transparent p-0"
        >
          {(["chat", "style", "pages"] as const).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-none px-3 pb-2 pt-1 text-xs capitalize"
              style={{ letterSpacing: "0.02em" }}
            >
              {tab === "chat" ? "Chat" : tab === "style" ? "Style" : "Pages"}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Tab content */}
      <TabsContent value="chat" className="mt-0 flex-1 overflow-hidden">
        <ChatPanel
          sendMessage={sendMessage}
          lastChatResponse={lastChatResponse}
        />
      </TabsContent>

      <TabsContent value="style" className="mt-0 flex-1 overflow-hidden">
        <StylePanel siteModel={siteModel} />
      </TabsContent>

      <TabsContent value="pages" className="mt-0 flex-1 overflow-hidden">
        <PagesPanel
          siteModel={siteModel}
          previewUrl={previewUrl}
          onNavigate={onNavigate}
          sendMessage={sendMessage}
        />
      </TabsContent>
    </Tabs>
  );
}
