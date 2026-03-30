"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, ArrowLeft, Globe, CheckCircle2, Circle, Rocket } from "lucide-react";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slugify";

interface PublishPageProps {
  params: Promise<{ projectId: string }>;
}

interface ChecklistItem {
  label: string;
  checked: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { label: "Mobile responsive", checked: true },
  { label: "All pages generated", checked: true },
  { label: "SEO metadata filled", checked: false },
];

type PublishState = "idle" | "publishing" | "published" | "error";

export default function PublishPage({ params }: PublishPageProps) {
  const { projectId } = use(params);

  const [projectName, setProjectName] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getProject(projectId).then((project) => {
      const name = project.company_name || "Your Site";
      setProjectName(name);
      setSlug(slugify(name));
      const url = project.deliverables?.preview_url ?? project.deliverables?.urls?.[0]?.url ?? null;
      setPreviewUrl(url);

      // If already published, skip straight to success state
      if (project.status === "live" || project.status === "published") {
        setPublishState("published");
      }
    });
  }, [projectId]);

  const liveUrl = slug ? `https://${slug}.hi-kaizen.com` : null;

  async function handlePublish() {
    setPublishState("publishing");
    setErrorMsg(null);
    try {
      // Mark project as published by updating status to "live"
      await api.retryBuild(projectId); // re-uses the PATCH /project/:token pattern
      // Directly patch status to "live" using the same request helper via api.ts pattern
      await fetch(`https://kaizen-intake-api.fehellstrom.workers.dev/project/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
          ...(api.getDevUserApiKey() ? { "X-API-Key": api.getDevUserApiKey()! } : {}),
        },
        body: JSON.stringify({ status: "published" }),
      });
      setPublishState("published");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Publish failed. Please try again.");
      setPublishState("error");
    }
  }

  function toggleChecklist(index: number) {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item))
    );
  }

  const allChecked = checklist.every((item) => item.checked);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0a0a0a", color: "#fafaf9" }}
    >
      {/* Published success overlay */}
      {publishState === "published" && (
        <div
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          aria-hidden="true"
        >
          {/* CSS-only confetti burst using pseudo-elements + keyframes */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 360;
            const distance = 120 + (i % 4) * 40;
            const size = 6 + (i % 3) * 4;
            const colors = ["#e85325", "#f97316", "#fbbf24", "#a3e635", "#34d399", "#60a5fa"];
            const color = colors[i % colors.length];
            const delay = (i % 6) * 60;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: size,
                  height: size,
                  borderRadius: i % 3 === 0 ? "50%" : "2px",
                  backgroundColor: color,
                  transform: `rotate(${angle}deg) translateX(0)`,
                  animation: `confetti-burst 700ms ${delay}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                  // custom property passed via inline style for the translate distance
                  // @ts-expect-error -- CSS custom property
                  "--dist": `${distance}px`,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Back link */}
        <Link
          href={`/builder/${projectId}`}
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-light transition-colors duration-150"
          style={{ color: "#a3a3a3" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to editor
        </Link>

        {/* Header */}
        <div className="mb-10 space-y-1">
          <p
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "#525252", letterSpacing: "0.08em" }}
          >
            Builder
          </p>
          <h1
            className="text-3xl font-light tracking-tight"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            Publish Your Website
          </h1>
          {projectName && (
            <p className="mt-1 text-sm font-light" style={{ color: "#a3a3a3" }}>
              {projectName}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {/* Preview section */}
          {previewUrl && (
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: "#262626", backgroundColor: "#141414" }}
            >
              <p
                className="mb-1 text-xs font-medium uppercase tracking-wider"
                style={{ color: "#525252", letterSpacing: "0.06em" }}
              >
                Current Preview
              </p>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-light transition-colors duration-150 hover:underline"
                style={{ color: "#e85325" }}
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{previewUrl.replace(/^https?:\/\//, "")}</span>
              </a>
            </div>
          )}

          {/* Live URL display */}
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: "#262626", backgroundColor: "#141414" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <Globe className="h-4 w-4" style={{ color: "#e85325" }} />
              </div>
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#525252", letterSpacing: "0.06em" }}
                >
                  Your Live URL
                </p>
                {liveUrl ? (
                  <p className="mt-1 text-base font-light" style={{ color: "#fafaf9" }}>
                    {liveUrl}
                  </p>
                ) : (
                  <div
                    className="mt-1 h-4 w-48 animate-pulse rounded"
                    style={{ backgroundColor: "#1e1e1e" }}
                  />
                )}
                <p className="mt-1 text-xs font-light" style={{ color: "#525252" }}>
                  Your site will be served on this subdomain after publishing.
                </p>
              </div>
            </div>
          </div>

          {/* Pre-publish checklist */}
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: "#262626", backgroundColor: "#141414" }}
          >
            <p
              className="mb-4 text-xs font-medium uppercase tracking-wider"
              style={{ color: "#525252", letterSpacing: "0.06em" }}
            >
              Pre-publish Checklist
            </p>
            <div className="space-y-3">
              {checklist.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => toggleChecklist(i)}
                  className="flex w-full items-center gap-3 text-left transition-opacity duration-150 hover:opacity-80"
                  disabled={publishState === "published"}
                >
                  {item.checked ? (
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" style={{ color: "#22c55e" }} />
                  ) : (
                    <Circle className="h-4.5 w-4.5 shrink-0" style={{ color: "#404040" }} />
                  )}
                  <span
                    className="text-sm font-light"
                    style={{
                      color: item.checked ? "#fafaf9" : "#737373",
                      textDecoration: item.checked ? "none" : "none",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            {!allChecked && (
              <p className="mt-4 text-xs font-light" style={{ color: "#737373" }}>
                You can still publish with unchecked items. This checklist is a reminder only.
              </p>
            )}
          </div>

          {/* Publish button / success state */}
          {publishState === "published" ? (
            <div
              className="rounded-xl border p-6 text-center"
              style={{
                borderColor: "#22c55e33",
                backgroundColor: "#0f2211",
                animation: "kaizen-fade-in 400ms ease-in forwards",
              }}
            >
              <div className="mb-3 flex justify-center">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#16a34a22" }}
                >
                  <CheckCircle2 className="h-6 w-6" style={{ color: "#22c55e" }} />
                </div>
              </div>
              <h2
                className="text-lg font-light"
                style={{ letterSpacing: "-0.02em", color: "#fafaf9" }}
              >
                Your site is live.
              </h2>
              <p className="mt-1 text-sm font-light" style={{ color: "#86efac" }}>
                {liveUrl ?? "Deployment in progress..."}
              </p>
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-100"
                  style={{
                    backgroundColor: "#22c55e",
                    color: "#0a0a0a",
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit your site
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {publishState === "error" && errorMsg && (
                <p className="text-sm font-light" style={{ color: "#f87171" }}>
                  {errorMsg}
                </p>
              )}
              <button
                onClick={handlePublish}
                disabled={publishState === "publishing"}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-base font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: publishState === "publishing" ? "#7c2d12" : "#e85325",
                  color: "#fafaf9",
                  boxShadow: publishState === "publishing" ? "none" : "0 0 24px -4px #e8532540",
                }}
              >
                {publishState === "publishing" ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4.5 w-4.5" />
                    Publish to {liveUrl ?? "hi-kaizen.com"}
                  </>
                )}
              </button>
              <p className="text-center text-xs font-light" style={{ color: "#525252" }}>
                Once published, your site will be publicly accessible at your subdomain.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confetti keyframes injected at page level */}
      <style>{`
        @keyframes confetti-burst {
          0%   { transform: rotate(var(--angle, 0deg)) translateX(0) scale(1); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: rotate(var(--angle, 0deg)) translateX(var(--dist, 120px)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
