"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, Check, Loader2, AlertCircle } from "lucide-react";

const PREVIEW_API = "https://kaizen-preview.fehellstrom.workers.dev";

/* ── Types ── */

interface SchemaField {
  key: string;
  type: "text" | "textarea" | "image_url" | "color";
  label: string;
  value: string;
}

interface SchemaSection {
  id: string;
  type: string;
  fields: SchemaField[];
}

interface SchemaPage {
  sections: SchemaSection[];
}

interface Schema {
  site_name?: { type: string; label: string; value?: string };
  accent_color?: { type: string; label: string; value?: string };
  nav?: { links?: { type: string; label: string; value?: { href: string; label: string }[] } };
  footer?: Record<string, { type: string; label: string; value?: string }>;
  pages: Record<string, SchemaPage>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/* ── Helpers ── */

function getJwt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kaizen_jwt");
}

async function fetchSchema(slug: string): Promise<Schema> {
  const jwt = getJwt();
  const res = await fetch(`${PREVIEW_API}/api/${slug}/schema`, {
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  });
  if (!res.ok) throw new Error(`Schema fetch failed: ${res.status}`);
  return res.json();
}

async function patchModel(
  slug: string,
  updates: { page?: string; section_id?: string; field: string; value: string }[]
): Promise<{ ok: boolean }> {
  const jwt = getJwt();
  const res = await fetch(`${PREVIEW_API}/api/${slug}/model`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) throw new Error(`Patch failed: ${res.status}`);
  return res.json();
}

/* ── Background label ── */

const bgLabels: Record<string, string> = {
  dark: "Dark",
  warm: "Warm",
  cool: "Cool",
  light: "Light",
};

/* ── Debounced field hook ── */

function useDebouncedSave(
  slug: string,
  delay: number,
  onStatusChange: (s: SaveStatus) => void,
  onSaved?: () => void
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (updates: { page?: string; section_id?: string; field: string; value: string }[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      onStatusChange("saving");
      timerRef.current = setTimeout(async () => {
        try {
          await patchModel(slug, updates);
          onStatusChange("saved");
          onSaved?.();
          setTimeout(() => onStatusChange("idle"), 1500);
        } catch {
          onStatusChange("error");
          setTimeout(() => onStatusChange("idle"), 3000);
        }
      }, delay);
    },
    [slug, delay, onStatusChange, onSaved]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return save;
}

/* ── Field renderer ── */

function FieldEditor({
  field,
  onChange,
}: {
  field: SchemaField;
  onChange: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState(field.value ?? "");

  useEffect(() => {
    setLocalValue(field.value ?? "");
  }, [field.value]);

  function handleChange(v: string) {
    setLocalValue(v);
    onChange(v);
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-muted-foreground/70">
          {field.label}
        </label>
        <Textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[80px] resize-y bg-muted/30 text-sm border-border/40 focus:border-primary/40"
        />
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-muted-foreground/70">
          {field.label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-border/40 bg-transparent"
          />
          <Input
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 bg-muted/30 text-sm border-border/40 focus:border-primary/40"
          />
        </div>
      </div>
    );
  }

  if (field.type === "image_url") {
    return (
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-muted-foreground/70">
          {field.label}
        </label>
        <Input
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-muted/30 text-sm border-border/40 focus:border-primary/40"
          placeholder="https://..."
        />
        {localValue && (
          <div className="mt-1 overflow-hidden rounded border border-border/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={localValue}
              alt={field.label}
              className="h-16 w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Default: text
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-muted-foreground/70">
        {field.label}
      </label>
      <Input
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-muted/30 text-sm border-border/40 focus:border-primary/40"
      />
    </div>
  );
}

/* ── Section card (collapsible) ── */

function SectionCard({
  section,
  page,
  background,
  onFieldChange,
}: {
  section: SchemaSection;
  page: string;
  background?: string;
  onFieldChange: (page: string, sectionId: string, field: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader
        className="cursor-pointer select-none px-4 py-3"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          )}
          <Badge variant="outline" className="text-[10px] font-normal">
            {section.type}
          </Badge>
          {background && bgLabels[background] && (
            <span className="text-[10px] text-muted-foreground/50">
              {bgLabels[background]}
            </span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground/40">
            {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4 px-4 pb-4 pt-0">
          {section.fields.map((f) => (
            <FieldEditor
              key={f.key}
              field={f}
              onChange={(value) => onFieldChange(page, section.id, f.key, value)}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

/* ── Save indicator ── */

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-500">Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-red-400" />
          <span className="text-red-400">Save failed</span>
        </>
      )}
    </div>
  );
}

/* ── Loading skeleton ── */

function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  );
}

/* ── Top-level fields editor ── */

function TopLevelFields({
  schema,
  onFieldChange,
}: {
  schema: Schema;
  onFieldChange: (field: string, value: string) => void;
}) {
  const fields: SchemaField[] = [];

  if (schema.site_name) {
    fields.push({
      key: "site_name",
      type: "text",
      label: schema.site_name.label || "Site Name",
      value: (schema.site_name.value as string) ?? "",
    });
  }
  if (schema.accent_color) {
    fields.push({
      key: "accent_color",
      type: "color",
      label: schema.accent_color.label || "Accent Color",
      value: (schema.accent_color.value as string) ?? "",
    });
  }

  // Footer fields
  if (schema.footer) {
    for (const [key, def] of Object.entries(schema.footer)) {
      if (def && typeof def === "object" && "label" in def) {
        fields.push({
          key: `footer.${key}`,
          type: "text",
          label: def.label || key,
          value: (def.value as string) ?? "",
        });
      }
    }
  }

  if (fields.length === 0) return null;

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-normal">
            Site Settings
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 pt-0">
        {fields.map((f) => (
          <FieldEditor
            key={f.key}
            field={f}
            onChange={(value) => onFieldChange(f.key, value)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

/* ── Main component ── */

export function ProjectContentEditor({
  slug,
  token: _token,
}: {
  slug: string;
  token: string;
}) {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [activePage, setActivePage] = useState<string | null>(null);

  const debouncedSave = useDebouncedSave(slug, 500, setSaveStatus);

  useEffect(() => {
    fetchSchema(slug)
      .then((s) => {
        setSchema(s);
        const pages = Object.keys(s.pages || {});
        if (pages.length > 0) setActivePage(pages[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  function handleSectionFieldChange(
    page: string,
    sectionId: string,
    field: string,
    value: string
  ) {
    debouncedSave([{ page, section_id: sectionId, field, value }]);
  }

  function handleTopLevelFieldChange(field: string, value: string) {
    debouncedSave([{ field, value }]);
  }

  if (loading) return <EditorSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/20 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-5 w-5 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Content editor unavailable
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">{error}</p>
      </div>
    );
  }

  if (!schema) return null;

  const pages = Object.entries(schema.pages || {});
  const currentPage = activePage
    ? schema.pages[activePage]
    : pages[0]?.[1];
  const currentPageKey = activePage || pages[0]?.[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground/60">
          Edit content directly. Changes appear on the preview instantly.
        </p>
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Top-level site settings */}
      <TopLevelFields
        schema={schema}
        onFieldChange={handleTopLevelFieldChange}
      />

      {/* Page tabs */}
      {pages.length > 1 && (
        <div className="flex items-center gap-3 border-b border-border/30 pb-2">
          {pages.map(([pageKey]) => {
            const label =
              pageKey === "index.html"
                ? "Home"
                : pageKey
                    .replace(/\/index\.html$/, "")
                    .replace(/\//g, "")
                    .replace(/-/g, " ")
                    .replace(/^\w/, (c) => c.toUpperCase());
            return (
              <button
                key={pageKey}
                onClick={() => setActivePage(pageKey)}
                className={`text-xs transition-colors duration-200 ${
                  currentPageKey === pageKey
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  {label}
                  {currentPageKey === pageKey && (
                    <span className="absolute inset-x-0 -bottom-2.5 h-px bg-primary" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Separator className="opacity-30" />

      {/* Section cards */}
      {currentPage && currentPage.sections?.length > 0 ? (
        <div className="space-y-3">
          {currentPage.sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              page={currentPageKey!}
              onFieldChange={handleSectionFieldChange}
            />
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No editable sections found for this page.
        </p>
      )}
    </div>
  );
}
