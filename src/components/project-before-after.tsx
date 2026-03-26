"use client";

import { useState, useRef, useCallback } from "react";

export function ProjectBeforeAfter({
  originalUrl,
  previewUrl,
}: {
  originalUrl: string;
  previewUrl: string;
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSlider = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.min(Math.max((x / rect.width) * 100, 5), 95);
      setSliderPos(percent);
    },
    []
  );

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSlider(e.clientX);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragging) updateSlider(e.clientX);
  }

  function handlePointerUp() {
    setDragging(false);
  }

  return (
    <div className="space-y-3">
      {/* Desktop: slider comparison */}
      <div
        ref={containerRef}
        className="comparison-enter relative hidden aspect-video w-full cursor-col-resize overflow-hidden rounded-lg border border-border/60 md:block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* After (right/full) */}
        <iframe
          src={previewUrl}
          className="absolute inset-0 h-full w-full border-0"
          title="After: Kaizen rebuild"
        />

        {/* Before (left, clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <iframe
            src={originalUrl}
            className="h-full w-full border-0"
            title="Before: Original website"
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-foreground/80"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-sm">
            <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
          Before
        </div>
        <div className="pointer-events-none absolute top-3 right-3 z-10 rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
          After
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="space-y-3 md:hidden">
        <div>
          <p className="mb-1.5 text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">Before</p>
          <div className="aspect-video overflow-hidden rounded-lg border border-border/60">
            <iframe
              src={originalUrl}
              className="h-full w-full border-0"
              title="Before: Original website"
            />
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">After</p>
          <div className="aspect-video overflow-hidden rounded-lg border border-border/60">
            <iframe
              src={previewUrl}
              className="h-full w-full border-0"
              title="After: Kaizen rebuild"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
