"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const API_BASE = "https://kaizen-intake-api.fehellstrom.workers.dev";

interface AdminProject {
  token: string;
  company: string;
  name: string;
  email: string;
  tier: string;
  status: string;
  created_at: string;
  deliverables?: {
    preview_url?: string;
    urls?: { label: string; url: string }[];
  };
}

interface BuildLogSection {
  type: string;
  page?: string;
  background?: string;
}

interface BuildLog {
  version?: number;
  model?: string;
  industry?: string;
  duration_ms?: number;
  timestamp?: string;
  sections?: BuildLogSection[];
  prompt?: string;
  system_prompt?: string;
  raw_response?: object;
  pages?: { path: string; title: string; sections: BuildLogSection[] }[];
}

const STATUS_COLORS: Record<string, string> = {
  intake_received: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  spec_writing: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  spec_review: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  building: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  review_ready: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  revising: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  live: "bg-green-500/15 text-green-400 border-green-500/20",
  failed: "bg-red-500/15 text-red-400 border-red-500/20",
};

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-foreground/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/[0.02] transition-colors"
      >
        <span>{title}</span>
        <span className="text-foreground/40 text-xs">{open ? "Collapse" : "Expand"}</span>
      </button>
      {open && (
        <div className="border-t border-foreground/10 bg-foreground/[0.01]">
          {children}
        </div>
      )}
    </div>
  );
}

function JsonViewer({ data }: { data: unknown }) {
  return (
    <pre className="p-4 text-xs text-foreground/70 overflow-auto max-h-[500px] font-mono leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function AdminProjectDetailPage() {
  const params = useParams();
  const token = params.token as string;

  const [project, setProject] = useState<AdminProject | null>(null);
  const [buildLog, setBuildLog] = useState<BuildLog | null>(null);
  const [buildLogError, setBuildLogError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "";
        const res = await fetch(`${API_BASE}/projects/${token}`, {
          headers: { "X-API-Key": apiKey },
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        setProject(data);

        // Fetch build log from preview URL
        const previewUrl = data.deliverables?.preview_url;
        if (previewUrl) {
          try {
            const logRes = await fetch(`${previewUrl}/_build-log.json`);
            if (logRes.ok) {
              setBuildLog(await logRes.json());
            } else {
              setBuildLogError("No build log available (HTTP " + logRes.status + ")");
            }
          } catch {
            setBuildLogError("Could not fetch build log");
          }
        } else {
          setBuildLogError("No preview URL, build log unavailable");
        }
      } catch (err) {
        setBuildLogError("Failed to load project");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center text-foreground/40 text-sm">
        Project not found.{" "}
        <Link href="/admin" className="text-primary hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[project.status] ?? "bg-foreground/10 text-foreground/60";

  // Collect all sections across pages
  const allSections: (BuildLogSection & { page?: string })[] = [];
  if (buildLog?.pages) {
    for (const page of buildLog.pages) {
      for (const section of page.sections ?? []) {
        allSections.push({ ...section, page: page.path });
      }
    }
  } else if (buildLog?.sections) {
    for (const section of buildLog.sections) {
      allSections.push(section);
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
        >
          Projects
        </Link>
        <span className="text-xs text-foreground/20 mx-2">/</span>
        <span className="text-xs text-foreground/60">{project.company || "Untitled"}</span>
      </div>

      {/* Project header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-foreground mb-2">
            {project.company || "Untitled"}
          </h1>
          <div className="flex items-center gap-3 text-sm text-foreground/50">
            <span>{project.email}</span>
            <span className="text-foreground/20">|</span>
            <span className="capitalize">{project.tier}</span>
            <Badge variant="outline" className={`${statusColor} border text-xs`}>
              {project.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
        {project.deliverables?.preview_url && (
          <a
            href={project.deliverables.preview_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Open Preview
          </a>
        )}
      </div>

      {/* Build Log */}
      <h2 className="text-lg font-light tracking-tight text-foreground mb-4">Build Log</h2>

      {buildLogError && !buildLog ? (
        <Card className="border-foreground/10 bg-foreground/[0.02] mb-8">
          <CardContent className="py-8 text-center text-foreground/40 text-sm">
            {buildLogError}
          </CardContent>
        </Card>
      ) : buildLog ? (
        <div className="space-y-4 mb-8">
          {/* Build metadata */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {buildLog.model && (
              <Card className="border-foreground/10 bg-foreground/[0.02] px-4 py-3">
                <div className="text-sm font-medium text-foreground">{buildLog.model}</div>
                <div className="text-xs text-foreground/40 mt-1">Model</div>
              </Card>
            )}
            {buildLog.industry && (
              <Card className="border-foreground/10 bg-foreground/[0.02] px-4 py-3">
                <div className="text-sm font-medium text-foreground capitalize">
                  {buildLog.industry}
                </div>
                <div className="text-xs text-foreground/40 mt-1">Industry</div>
              </Card>
            )}
            {buildLog.duration_ms != null && (
              <Card className="border-foreground/10 bg-foreground/[0.02] px-4 py-3">
                <div className="text-sm font-medium text-foreground">
                  {(buildLog.duration_ms / 1000).toFixed(1)}s
                </div>
                <div className="text-xs text-foreground/40 mt-1">Build Duration</div>
              </Card>
            )}
            {allSections.length > 0 && (
              <Card className="border-foreground/10 bg-foreground/[0.02] px-4 py-3">
                <div className="text-sm font-medium text-foreground">{allSections.length}</div>
                <div className="text-xs text-foreground/40 mt-1">Sections</div>
              </Card>
            )}
            {buildLog.timestamp && (
              <Card className="border-foreground/10 bg-foreground/[0.02] px-4 py-3">
                <div className="text-sm font-medium text-foreground">
                  {new Date(buildLog.timestamp).toLocaleDateString("en-SE", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-xs text-foreground/40 mt-1">Built At</div>
              </Card>
            )}
          </div>

          {/* Sections selected */}
          {allSections.length > 0 && (
            <Card className="border-foreground/10 bg-foreground/[0.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  Sections Selected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-foreground/10">
                        <th className="px-3 py-2 text-left font-medium text-foreground/40">Type</th>
                        <th className="px-3 py-2 text-left font-medium text-foreground/40">Page</th>
                        <th className="px-3 py-2 text-left font-medium text-foreground/40">
                          Background
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSections.map((s, i) => (
                        <tr
                          key={i}
                          className="border-b border-foreground/5 hover:bg-foreground/[0.02]"
                        >
                          <td className="px-3 py-2 font-mono text-foreground/80">{s.type}</td>
                          <td className="px-3 py-2 text-foreground/50">{s.page ?? "index.html"}</td>
                          <td className="px-3 py-2 text-foreground/50">{s.background ?? "light"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prompts */}
          {buildLog.system_prompt && (
            <CollapsibleSection title="System Prompt">
              <pre className="p-4 text-xs text-foreground/60 overflow-auto max-h-[400px] font-mono leading-relaxed whitespace-pre-wrap">
                {buildLog.system_prompt}
              </pre>
            </CollapsibleSection>
          )}

          {buildLog.prompt && (
            <CollapsibleSection title="User Prompt">
              <pre className="p-4 text-xs text-foreground/60 overflow-auto max-h-[400px] font-mono leading-relaxed whitespace-pre-wrap">
                {buildLog.prompt}
              </pre>
            </CollapsibleSection>
          )}

          {/* Raw Gemini response */}
          {buildLog.raw_response && (
            <CollapsibleSection title="Raw Gemini Response">
              <JsonViewer data={buildLog.raw_response} />
            </CollapsibleSection>
          )}

          {/* Full build log JSON */}
          <CollapsibleSection title="Full Build Log JSON">
            <JsonViewer data={buildLog as object} />
          </CollapsibleSection>
        </div>
      ) : null}
    </div>
  );
}
