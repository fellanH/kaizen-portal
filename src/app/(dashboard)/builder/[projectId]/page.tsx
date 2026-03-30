"use client";

import { use, useEffect, useRef, useState } from "react";
import { useBuilderWs } from "@/hooks/use-builder-ws";
import { GenerationProgress } from "@/components/builder/generation-progress";
import { EditorShell } from "@/components/builder/editor-shell";

interface BuilderPageProps {
  params: Promise<{ projectId: string }>;
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const { projectId } = use(params);
  const { status, progress, previewUrl, siteModel, sendMessage } =
    useBuilderWs(projectId);

  // Chat responses come via a custom window event dispatched from the WS hook.
  const [lastChatResponse, setLastChatResponse] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ message: string }>;
      setLastChatResponse(custom.detail.message);
    };
    window.addEventListener(`kaizen-chat-response-${projectId}`, handler);
    return () => {
      window.removeEventListener(`kaizen-chat-response-${projectId}`, handler);
    };
  }, [projectId]);

  // Transition state
  const [showEditor, setShowEditor] = useState(false);
  const [progressVisible, setProgressVisible] = useState(true);
  const transitionTriggered = useRef(false);

  useEffect(() => {
    if (status === "ready" && !transitionTriggered.current) {
      transitionTriggered.current = true;
      setProgressVisible(false); // triggers opacity-0 fade on progress
      const t = setTimeout(() => {
        setShowEditor(true);
      }, 320);
      return () => clearTimeout(t);
    }
  }, [status]);

  const isGenerating = status === "connecting" || status === "generating";
  const showProgress = (isGenerating || (!showEditor && status !== "error")) && progressVisible;

  return (
    <div
      className="relative h-full overflow-hidden"
      style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}
    >
      {/* Error state */}
      {status === "error" && !showEditor && (
        <div className="flex h-full min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-light" style={{ color: "#fafaf9" }}>
              Generation encountered an error.
            </p>
            <p className="text-xs font-light" style={{ color: "#a3a3a3" }}>
              Please refresh the page or contact support.
            </p>
          </div>
        </div>
      )}

      {/* State A: Generation progress (also handles fade-out when ready) */}
      {showProgress && (
        <div
          className="absolute inset-0 z-10"
          style={{
            opacity: progressVisible ? 1 : 0,
            transition: "opacity 300ms ease-out",
            pointerEvents: progressVisible ? "auto" : "none",
          }}
        >
          <GenerationProgress
            step={progress.step}
            total={progress.total}
            statusMessage={progress.statusMessage}
          />
        </div>
      )}

      {/* State B: Editor shell (fades in after progress fades out) */}
      {showEditor && (
        <div
          className="absolute inset-0 z-20"
          style={{
            opacity: 1,
            animation: "kaizen-fade-in 300ms ease-in forwards",
          }}
        >
          <EditorShell
            previewUrl={previewUrl}
            siteModel={siteModel}
            sendMessage={sendMessage}
            lastChatResponse={lastChatResponse}
          />
        </div>
      )}
    </div>
  );
}
