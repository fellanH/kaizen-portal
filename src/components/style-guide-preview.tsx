"use client";

import { useEffect } from "react";
import type { StyleGuide } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ── Google Fonts loader ── */
function useGoogleFonts(fonts: string[]) {
  useEffect(() => {
    const families = fonts
      .filter(Boolean)
      .map((f) => f.replace(/\s+/g, "+"))
      .join("&family=");
    if (!families) return;

    const id = "style-guide-google-fonts";
    if (document.getElementById(id)) {
      const existing = document.getElementById(id) as HTMLLinkElement;
      existing.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
      return;
    }

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    document.head.appendChild(link);
  }, [fonts]);
}

/* ── Color swatch ── */
function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  const label = name.replace(/_/g, " ");
  // Determine if the swatch color is light (needs dark text) or dark (needs light text)
  const isLight = isLightColor(hex);

  return (
    <div className="group flex flex-col gap-1.5">
      <div
        className="relative h-14 w-full rounded-lg border border-border/40 transition-transform duration-200 hover:scale-105"
        style={{ backgroundColor: hex }}
      >
        <span
          className="absolute bottom-1.5 right-2 font-mono text-[10px] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ color: isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)" }}
        >
          {hex}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-1">
        <span className="text-[11px] capitalize text-muted-foreground leading-tight">{label}</span>
        <span className="font-mono text-[10px] text-muted-foreground/50">{hex}</span>
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

/* ── Button radius preview ── */
function ButtonRadiusPreview({ radius }: { radius: StyleGuide["ui"]["button_radius"] }) {
  const radiusMap = { sharp: "0px", soft: "8px", pill: "9999px" };
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 items-center justify-center border border-foreground/20 bg-foreground/5 px-5 text-xs font-medium text-foreground"
        style={{ borderRadius: radiusMap[radius] }}
      >
        Button
      </div>
      <span className="text-xs text-muted-foreground">{radius} ({radiusMap[radius]})</span>
    </div>
  );
}

/* ── Card shadow preview ── */
function CardShadowPreview({ shadow }: { shadow: StyleGuide["ui"]["card_shadow"] }) {
  const shadowMap = {
    none: "none",
    subtle: "0 1px 3px rgba(0,0,0,0.08)",
    elevated: "0 4px 16px rgba(0,0,0,0.12)",
  };
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-16 w-24 rounded-lg border border-border/40 bg-card"
        style={{ boxShadow: shadowMap[shadow] }}
      />
      <span className="text-xs text-muted-foreground">{shadow}</span>
    </div>
  );
}

/* ── Pattern badge row ── */
function PatternRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Badge variant="outline" className="border-border/60 text-[11px] font-normal">
        {value}
      </Badge>
    </div>
  );
}

/* ── Main component ── */
export function StyleGuidePreview({ guide }: { guide: StyleGuide }) {
  useGoogleFonts([guide.typography.heading_font, guide.typography.body_font]);

  const colorEntries: [string, string][] = [
    ["background", guide.colors.background],
    ["surface", guide.colors.surface],
    ["surface alt", guide.colors.surface_alt],
    ["surface dark", guide.colors.surface_dark],
    ["surface dark alt", guide.colors.surface_dark_alt],
    ["ink", guide.colors.ink],
    ["ink secondary", guide.colors.ink_secondary],
    ["ink inverse", guide.colors.ink_inverse],
    ["ink inverse secondary", guide.colors.ink_inverse_secondary],
    ["accent", guide.colors.accent],
    ["accent dark", guide.colors.accent_dark],
    ["border", guide.colors.border],
  ];

  const scaleLabel = {
    compact: "Compact (tighter hierarchy)",
    default: "Default (balanced)",
    editorial: "Editorial (dramatic scale)",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/60">
            Style Guide
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {guide.brand_name} &middot; {guide.industry}
          </p>
        </div>
        <Badge variant="outline" className="border-border/60 text-[11px] font-normal capitalize">
          {guide.colors.mode} palette
        </Badge>
      </div>

      {/* Colors */}
      <Card className="border-border/40">
        <CardContent className="px-5 py-4">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground/60">
            Colors ({colorEntries.length} tokens)
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {colorEntries.map(([name, hex]) => (
              <ColorSwatch key={name} name={name} hex={hex} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="border-border/40">
        <CardContent className="px-5 py-4">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground/60">
            Typography
          </p>
          <div className="space-y-5">
            {/* Heading font */}
            <div>
              <p className="mb-1.5 text-[11px] text-muted-foreground/60">Heading</p>
              <p
                className="text-2xl leading-tight text-foreground"
                style={{
                  fontFamily: `'${guide.typography.heading_font}', sans-serif`,
                  fontWeight: guide.typography.heading_weight,
                }}
              >
                {guide.brand_name}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground/50">
                {guide.typography.heading_font} &middot; {guide.typography.heading_weight}
              </p>
            </div>

            <Separator className="opacity-40" />

            {/* Body font */}
            <div>
              <p className="mb-1.5 text-[11px] text-muted-foreground/60">Body</p>
              <p
                className="text-sm leading-relaxed text-foreground"
                style={{
                  fontFamily: `'${guide.typography.body_font}', sans-serif`,
                  fontWeight: guide.typography.body_weight,
                }}
              >
                The quick brown fox jumps over the lazy dog. Professional services
                delivered with precision and care, building trust through quality work.
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground/50">
                {guide.typography.body_font} &middot; {guide.typography.body_weight}
              </p>
            </div>

            <Separator className="opacity-40" />

            {/* Scale */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground/60">Type Scale</p>
              <Badge variant="outline" className="border-border/60 text-[11px] font-normal">
                {scaleLabel[guide.typography.scale]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UI Patterns */}
      <Card className="border-border/40">
        <CardContent className="px-5 py-4">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground/60">
            UI Patterns
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Visual previews */}
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] text-muted-foreground/60">Button Radius</p>
                <ButtonRadiusPreview radius={guide.ui.button_radius} />
              </div>
              <div>
                <p className="mb-2 text-[11px] text-muted-foreground/60">Card Shadow</p>
                <CardShadowPreview shadow={guide.ui.card_shadow} />
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-1">
              <PatternRow label="Card Radius" value={guide.ui.card_radius} />
              <PatternRow label="Nav Style" value={guide.ui.nav_style} />
              <PatternRow label="Section Spacing" value={guide.ui.section_spacing} />
              <PatternRow label="Personality" value={guide.personality} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
