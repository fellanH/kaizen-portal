"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface StyleGuide {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    [key: string]: string | undefined;
  };
  fonts?: {
    heading?: string;
    body?: string;
    [key: string]: string | undefined;
  };
  spacing?: {
    unit?: string;
    [key: string]: string | undefined;
  };
}

interface StylePanelProps {
  siteModel: unknown;
}

function extractStyleGuide(siteModel: unknown): StyleGuide | null {
  if (!siteModel || typeof siteModel !== "object") return null;
  const m = siteModel as Record<string, unknown>;
  if (m.styleGuide && typeof m.styleGuide === "object") {
    return m.styleGuide as StyleGuide;
  }
  return null;
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${value}`}
      className="flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors hover:border-white/20"
      style={{ borderColor: "#262626", backgroundColor: "#1c1c1c" }}
    >
      <span
        className="h-6 w-6 shrink-0 rounded"
        style={{ backgroundColor: value, border: "1px solid rgba(255,255,255,0.08)" }}
      />
      <div className="flex min-w-0 flex-col items-start gap-0.5">
        <span
          className="text-[10px] font-light uppercase tracking-wider"
          style={{ color: "#a3a3a3" }}
        >
          {label}
        </span>
        <span
          className="font-mono text-[11px]"
          style={{ color: copied ? "#e85325" : "#fafaf9" }}
        >
          {copied ? "Copied" : value}
        </span>
      </div>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-medium uppercase tracking-widest"
      style={{ color: "#a3a3a3" }}
    >
      {children}
    </p>
  );
}

export function StylePanel({ siteModel }: StylePanelProps) {
  const styleGuide = extractStyleGuide(siteModel);

  if (!styleGuide) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <p
          className="text-center text-xs font-light"
          style={{ color: "#a3a3a3" }}
        >
          Style guide will appear here once generation is complete.
        </p>
      </div>
    );
  }

  const colorEntries = styleGuide.colors
    ? Object.entries(styleGuide.colors).filter(([, v]) => v)
    : [];

  const fontEntries = styleGuide.fonts
    ? Object.entries(styleGuide.fonts).filter(([, v]) => v)
    : [];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto px-4 py-4">
      {/* Colors */}
      {colorEntries.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <SectionLabel>Colors</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {colorEntries.map(([key, value]) => (
              <ColorSwatch key={key} label={key} value={value!} />
            ))}
          </div>
          <p
            className="text-[10px] font-light"
            style={{ color: "#a3a3a3", opacity: 0.5 }}
          >
            Click a color to copy its hex value.
          </p>
        </div>
      )}

      {/* Fonts */}
      {fontEntries.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <SectionLabel>Typography</SectionLabel>
          <div className="flex flex-col gap-2">
            {fontEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col gap-0.5 rounded-lg border px-3 py-2.5"
                style={{ borderColor: "#262626", backgroundColor: "#1c1c1c" }}
              >
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "#a3a3a3" }}
                >
                  {key}
                </p>
                <p
                  className={cn("text-sm font-light")}
                  style={{ color: "#fafaf9", fontFamily: value }}
                >
                  {value}
                </p>
                <p
                  className="mt-0.5 text-xs font-light leading-snug"
                  style={{ color: "#a3a3a3", fontFamily: value }}
                >
                  The quick brown fox jumps
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacing */}
      {styleGuide.spacing && (
        <div className="flex flex-col gap-2.5">
          <SectionLabel>Spacing</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {Object.entries(styleGuide.spacing)
              .filter(([, v]) => v)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                  style={{ borderColor: "#262626", backgroundColor: "#1c1c1c" }}
                >
                  <span
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: "#a3a3a3" }}
                  >
                    {key}
                  </span>
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: "#fafaf9" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <p
        className="text-center text-[10px] font-light"
        style={{ color: "#a3a3a3", opacity: 0.4 }}
      >
        Style editing available in a future update.
      </p>
    </div>
  );
}
