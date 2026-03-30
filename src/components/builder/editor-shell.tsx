"use client";

import { useRef, useState, useCallback } from "react";
import { PreviewFrame } from "./preview-frame";
import { ChatPanel } from "./chat-panel";
import { StylePanel } from "./style-panel";
import { PagesPanel } from "./pages-panel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface EditorShellProps {
  previewUrl: string | null;
  siteModel: unknown;
  sendMessage: (data: Record<string, unknown>) => void;
  lastChatResponse: string | null;
}

const MIN_PANEL_WIDTH = 280;
const DEFAULT_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 560;

export function EditorShell({
  previewUrl,
  siteModel,
  sendMessage,
  lastChatResponse,
}: EditorShellProps) {
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
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
          onNavigate={handleNavigate}
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
        />
      </TabsContent>
    </Tabs>
  );
}
