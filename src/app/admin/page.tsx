import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AdminProjectActions } from "@/components/admin-project-actions";

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
  };
}

async function fetchProjects(): Promise<AdminProject[]> {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(`${API_BASE}/projects`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.projects ?? [];
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

function statusBadge(status: string) {
  const colors = STATUS_COLORS[status] ?? "bg-foreground/10 text-foreground/60";
  return (
    <Badge variant="outline" className={`${colors} border text-xs`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-SE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPage() {
  const projects = await fetchProjects();

  const sorted = [...projects].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const counts: Record<string, number> = {};
  for (const p of projects) {
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  }

  const healthCards = [
    { label: "Total", value: projects.length, color: "text-foreground" },
    { label: "Building", value: counts["building"] ?? 0, color: "text-cyan-400" },
    { label: "Pending Review", value: (counts["review_ready"] ?? 0) + (counts["spec_review"] ?? 0), color: "text-amber-400" },
    { label: "Live", value: counts["live"] ?? 0, color: "text-green-400" },
    { label: "Failed", value: counts["failed"] ?? 0, color: "text-red-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight text-foreground mb-6">
        Pipeline
      </h1>

      {/* Health summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 mb-8">
        {healthCards.map((card) => (
          <Card key={card.label} className="border-foreground/10 bg-foreground/[0.02] px-4 py-3">
            <div className={`text-2xl font-medium ${card.color}`}>{card.value}</div>
            <div className="text-xs text-foreground/40 mt-1">{card.label}</div>
          </Card>
        ))}
      </div>

      {/* Project table */}
      {sorted.length === 0 ? (
        <p className="text-foreground/40 text-sm">No projects found. Check ADMIN_API_KEY.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-foreground/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10 bg-foreground/[0.02]">
                <th className="px-4 py-3 text-left font-medium text-foreground/50">Company</th>
                <th className="px-4 py-3 text-left font-medium text-foreground/50">Email</th>
                <th className="px-4 py-3 text-left font-medium text-foreground/50">Status</th>
                <th className="px-4 py-3 text-left font-medium text-foreground/50">Tier</th>
                <th className="px-4 py-3 text-left font-medium text-foreground/50">Date</th>
                <th className="px-4 py-3 text-left font-medium text-foreground/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr
                  key={p.token}
                  className="border-b border-foreground/5 transition-colors hover:bg-foreground/[0.02]"
                >
                  <td className="px-4 py-3 text-foreground">
                    <Link
                      href={`/admin/projects/${p.token}`}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {p.company || "Untitled"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{p.email}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-foreground/60 capitalize">{p.tier}</td>
                  <td className="px-4 py-3 text-foreground/40">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <AdminProjectActions
                      token={p.token}
                      status={p.status}
                      previewUrl={p.deliverables?.preview_url}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
