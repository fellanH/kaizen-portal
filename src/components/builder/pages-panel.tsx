"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

interface SiteSection {
  type: string;
  background: string;
  content: Record<string, unknown>;
}

interface SitePage {
  slug: string;
  title: string;
  sections: SiteSection[];
}

interface SiteModel {
  pages: SitePage[];
  global: {
    company: string;
    nav_links: Array<{ title: string; href: string }>;
  };
}

interface PagesPanelProps {
  siteModel: unknown;
  previewUrl: string | null;
  onNavigate: (path: string) => void;
  sendMessage: (data: Record<string, unknown>) => void;
}

// ---------- Helpers ----------

function parseSiteModel(raw: unknown): SiteModel | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  if (!Array.isArray(m.pages)) return null;
  return raw as SiteModel;
}

/** Convert a kebab-case section type to a human-readable label. */
function humanizeType(type: string): string {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------- Icons (inline SVG, no deps) ----------

function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{
        color: "#a3a3a3",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.15s",
        flexShrink: 0,
      }}
    >
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronUp() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path
        d="M2 7.5L5.5 4l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronDownSmall() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path
        d="M2 3.5L5.5 7l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSwap() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path
        d="M1.5 3.5h8M7 1.5l2.5 2L7 5.5M9.5 7.5h-8M4 5.5L1.5 7.5 4 9.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path
        d="M1.5 3h8M4 3V2h3v1M4.5 5v3.5M6.5 5v3.5M2.5 3l.5 6h5l.5-6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path
        d="M9.5 5.5A4 4 0 1 1 5.5 1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M6 1l2 2-2 2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M5 1v8M1 5h8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------- Section row ----------

interface SectionRowProps {
  section: SiteSection;
  sectionIndex: number;
  pageIndex: number;
  isFirst: boolean;
  isLast: boolean;
  sendMessage: (data: Record<string, unknown>) => void;
}

function SectionRow({
  section,
  sectionIndex,
  pageIndex,
  isFirst,
  isLast,
  sendMessage,
}: SectionRowProps) {
  const handleMoveUp = () => {
    if (isFirst) return;
    // Build newOrder by swapping this index with previous
    sendMessage({
      type: "section_op",
      action: "reorder_sections",
      pageIndex,
      swapA: sectionIndex - 1,
      swapB: sectionIndex,
    });
  };

  const handleMoveDown = () => {
    if (isLast) return;
    sendMessage({
      type: "section_op",
      action: "reorder_sections",
      pageIndex,
      swapA: sectionIndex,
      swapB: sectionIndex + 1,
    });
  };

  const handleSwap = () => {
    sendMessage({
      type: "section_op",
      action: "swap_section",
      pageIndex,
      sectionIndex,
      currentType: section.type,
    });
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Remove section "${humanizeType(section.type)}"? This cannot be undone.`
    );
    if (!confirmed) return;
    sendMessage({
      type: "section_op",
      action: "remove_section",
      pageIndex,
      sectionIndex,
    });
  };

  const handleRegenerate = () => {
    sendMessage({
      type: "section_op",
      action: "regenerate_section",
      pageIndex,
      sectionIndex,
    });
  };

  return (
    <div
      className="group flex items-center gap-2 rounded px-2 py-1.5"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Section number badge */}
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-[9px] font-medium"
        style={{ backgroundColor: "#1c1c1c", color: "#a3a3a3" }}
      >
        {sectionIndex + 1}
      </span>

      {/* Label */}
      <span
        className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-light"
        style={{ color: "#fafaf9" }}
      >
        {humanizeType(section.type)}
      </span>

      {/* Action buttons (visible on group hover) */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Move up */}
        <button
          onClick={handleMoveUp}
          disabled={isFirst}
          title="Move up"
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10",
            isFirst && "opacity-20 cursor-not-allowed"
          )}
          style={{ color: "#a3a3a3" }}
        >
          <IconChevronUp />
        </button>

        {/* Move down */}
        <button
          onClick={handleMoveDown}
          disabled={isLast}
          title="Move down"
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10",
            isLast && "opacity-20 cursor-not-allowed"
          )}
          style={{ color: "#a3a3a3" }}
        >
          <IconChevronDownSmall />
        </button>

        {/* Swap */}
        <button
          onClick={handleSwap}
          title="Swap template"
          className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
          style={{ color: "#a3a3a3" }}
        >
          <IconSwap />
        </button>

        {/* Regenerate */}
        <button
          onClick={handleRegenerate}
          title="Regenerate content"
          className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
          style={{ color: "#a3a3a3" }}
        >
          <IconRefresh />
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          title="Delete section"
          className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-red-500/20"
          style={{ color: "#a3a3a3" }}
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

// ---------- Page accordion item ----------

interface PageItemProps {
  page: SitePage;
  pageIndex: number;
  previewUrl: string | null;
  onNavigate: (path: string) => void;
  sendMessage: (data: Record<string, unknown>) => void;
  defaultOpen?: boolean;
}

function PageItem({
  page,
  pageIndex,
  previewUrl,
  onNavigate,
  sendMessage,
  defaultOpen = false,
}: PageItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  const slug = page.slug ?? "/";
  const path = slug === "index" || slug === "/" ? "/" : `/${slug}`;

  const handleAddSection = () => {
    sendMessage({
      type: "section_op",
      action: "add_section",
      pageIndex,
    });
  };

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "#262626", backgroundColor: "#141414" }}
    >
      {/* Page header row */}
      <button
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
        onClick={() => setOpen((v) => !v)}
      >
        <IconChevronDown open={open} />

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <span
            className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-light"
            style={{ color: "#fafaf9" }}
          >
            {page.title ?? slug}
          </span>
          <span
            className="font-mono text-[10px]"
            style={{ color: "#a3a3a3" }}
          >
            {path}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-light"
            style={{ color: "#a3a3a3" }}
          >
            {page.sections?.length ?? 0}
          </span>

          {/* Navigate button */}
          {previewUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(path);
              }}
              title="Navigate to page"
              className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
              style={{ color: "#a3a3a3" }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 8L8 2M8 2H4M8 2v4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </button>

      {/* Sections list */}
      {open && (
        <div
          className="border-t px-2 pb-2 pt-1.5"
          style={{ borderColor: "#262626" }}
        >
          {page.sections && page.sections.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {page.sections.map((section, i) => (
                <SectionRow
                  key={`${section.type}-${i}`}
                  section={section}
                  sectionIndex={i}
                  pageIndex={pageIndex}
                  isFirst={i === 0}
                  isLast={i === page.sections.length - 1}
                  sendMessage={sendMessage}
                />
              ))}
            </div>
          ) : (
            <p
              className="py-2 text-center text-[10px] font-light"
              style={{ color: "#a3a3a3" }}
            >
              No sections yet.
            </p>
          )}

          {/* Add section */}
          <button
            onClick={handleAddSection}
            className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded py-1.5 text-[10px] font-light transition-colors hover:bg-white/5"
            style={{ color: "#a3a3a3", border: "1px dashed #262626" }}
          >
            <IconPlus />
            Add Section
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Main component ----------

export function PagesPanel({
  siteModel,
  previewUrl,
  onNavigate,
  sendMessage,
}: PagesPanelProps) {
  const model = parseSiteModel(siteModel);

  if (!model || model.pages.length === 0) {
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
    <div className="flex flex-col gap-2 overflow-y-auto px-3 py-3">
      <p
        className="px-1 text-[10px] font-medium uppercase tracking-widest"
        style={{ color: "#a3a3a3" }}
      >
        Pages ({model.pages.length})
      </p>

      {model.pages.map((page, i) => (
        <PageItem
          key={page.slug ?? i}
          page={page}
          pageIndex={i}
          previewUrl={previewUrl}
          onNavigate={onNavigate}
          sendMessage={sendMessage}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
