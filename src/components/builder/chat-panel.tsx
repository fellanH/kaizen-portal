"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatPanelProps {
  sendMessage: (data: Record<string, unknown>) => void;
  lastChatResponse: string | null;
}

export function ChatPanel({ sendMessage, lastChatResponse }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Append incoming assistant responses
  useEffect(() => {
    if (!lastChatResponse) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: lastChatResponse,
        timestamp: Date.now(),
      },
    ]);
    setIsSending(false);
  }, [lastChatResponse]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    sendMessage({ type: "chat", message: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p
              className="text-center text-xs font-light leading-relaxed"
              style={{ color: "#a3a3a3", maxWidth: 220 }}
            >
              Ask anything about your site. Request changes, new sections, or style adjustments.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-xs font-light leading-relaxed",
                  msg.role === "user"
                    ? "rounded-br-sm"
                    : "rounded-bl-sm"
                )}
                style={
                  msg.role === "user"
                    ? { backgroundColor: "#e85325", color: "#fafaf9" }
                    : { backgroundColor: "#1c1c1c", color: "#fafaf9", border: "1px solid #262626" }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div
                className="rounded-xl rounded-bl-sm px-3 py-2"
                style={{ backgroundColor: "#1c1c1c", border: "1px solid #262626" }}
              >
                <span className="builder-typing-dot" style={{ color: "#a3a3a3", fontSize: 11 }}>
                  ...
                </span>
              </div>
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 border-t p-3"
        style={{ borderColor: "#262626" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl border px-3 py-2"
          style={{ backgroundColor: "#1c1c1c", borderColor: "#262626" }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Request a change..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-xs font-light leading-relaxed outline-none placeholder:text-[#a3a3a3]/50"
            style={{ color: "#fafaf9", maxHeight: 120 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-opacity disabled:opacity-30"
            style={{ backgroundColor: "#e85325" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 8.5V1.5M5 1.5L2 4.5M5 1.5L8 4.5"
                stroke="#fafaf9"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p
          className="mt-1.5 text-center text-[10px] font-light"
          style={{ color: "#a3a3a3", opacity: 0.5 }}
        >
          Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
