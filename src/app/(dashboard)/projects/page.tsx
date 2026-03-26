"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Project } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tierColors: Record<string, string> = {
  starter: "bg-chart-5 text-foreground",
  professional: "bg-chart-2 text-foreground",
  premium: "bg-primary text-primary-foreground",
};

const statusColors: Record<string, string> = {
  intake_received: "bg-muted text-muted-foreground",
  spec_writing: "bg-chart-5 text-foreground",
  building: "bg-chart-2 text-foreground",
  review_ready: "bg-primary text-primary-foreground",
  live: "bg-green-600 text-white",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMyProjects()
      .then((data) => setProjects(data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Projects</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No projects yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When your project kicks off, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.token} href={`/projects/detail?token=${project.token}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">
                      {project.company_name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={tierColors[project.tier] || ""}
                    >
                      {project.tier}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={statusColors[project.status] || ""}
                    >
                      {statusLabel(project.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
