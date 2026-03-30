"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export interface BuilderMessage {
  type: "progress" | "ready" | "error" | "preview_updated" | "chat_response";
  step?: number;
  total?: number;
  label?: string;
  previewUrl?: string;
  siteModel?: unknown;
  error?: string;
  message?: string;
}

export interface BuilderProgress {
  step: number;
  total: number;
  label: string;
  statusMessage: string;
}

export type BuilderStatus = "connecting" | "generating" | "ready" | "error";

export interface UseBuilderWsReturn {
  status: BuilderStatus;
  progress: BuilderProgress;
  previewUrl: string | null;
  siteModel: unknown;
  sendMessage: (data: Record<string, unknown>) => void;
  isConnected: boolean;
}

const WS_BASE = "wss://kaizen-builder.fehellstrom.workers.dev/agents/BuilderAgent";

const DEFAULT_PROGRESS: BuilderProgress = {
  step: 0,
  total: 5,
  label: "Connecting...",
  statusMessage: "",
};

const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 30000;

export function useBuilderWs(projectId: string): UseBuilderWsReturn {
  const [status, setStatus] = useState<BuilderStatus>("connecting");
  const [progress, setProgress] = useState<BuilderProgress>(DEFAULT_PROGRESS);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [siteModel, setSiteModel] = useState<unknown>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const connect = useCallback(() => {
    if (!isMounted.current) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const url = `${WS_BASE}/${projectId}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted.current) return;
        reconnectAttempts.current = 0;
        setIsConnected(true);
        setStatus("generating");
      };

      ws.onmessage = (event) => {
        if (!isMounted.current) return;
        try {
          const msg: BuilderMessage = JSON.parse(event.data as string);

          switch (msg.type) {
            case "progress":
              setStatus("generating");
              setProgress({
                step: msg.step ?? 0,
                total: msg.total ?? 5,
                label: msg.label ?? "",
                statusMessage: msg.message ?? "",
              });
              break;

            case "ready":
              setStatus("ready");
              if (msg.previewUrl) setPreviewUrl(msg.previewUrl);
              if (msg.siteModel !== undefined) setSiteModel(msg.siteModel);
              break;

            case "preview_updated":
              if (msg.previewUrl) setPreviewUrl(msg.previewUrl);
              if (msg.siteModel !== undefined) setSiteModel(msg.siteModel);
              break;

            case "chat_response":
              // Dispatch a window event so the page component can forward
              // the message text to ChatPanel without prop-drilling the raw WS.
              if (typeof window !== "undefined" && msg.message) {
                window.dispatchEvent(
                  new CustomEvent(`kaizen-chat-response-${projectId}`, {
                    detail: { message: msg.message },
                  })
                );
              }
              break;

            case "error":
              setStatus("error");
              break;
          }
        } catch {
          // malformed message, ignore
        }
      };

      ws.onclose = () => {
        if (!isMounted.current) return;
        setIsConnected(false);
        wsRef.current = null;

        // Don't reconnect if already in terminal states
        if (status === "ready" || status === "error") return;

        const delay = Math.min(
          BACKOFF_BASE_MS * Math.pow(2, reconnectAttempts.current),
          BACKOFF_MAX_MS
        );
        reconnectAttempts.current += 1;

        reconnectTimer.current = setTimeout(() => {
          if (isMounted.current) connect();
        }, delay);
      };

      ws.onerror = () => {
        // onerror is followed by onclose, handle there
        if (!isMounted.current) return;
        setIsConnected(false);
      };
    } catch {
      // WebSocket constructor can throw if URL is invalid
      setStatus("error");
    }
  }, [projectId, status]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // Only run on mount / projectId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const sendMessage = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { status, progress, previewUrl, siteModel, sendMessage, isConnected };
}
