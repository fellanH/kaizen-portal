"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ProjectDetail } from "./project-detail";
import { api } from "@/lib/api";
import { slugify } from "@/lib/slugify";

function DetailResolver() {
  const searchParams = useSearchParams();
  const tokenFromParam = searchParams.get("token");
  const slugFromParam = searchParams.get("slug");

  const [resolvedToken, setResolvedToken] = useState<string | null>(tokenFromParam);
  const [loading, setLoading] = useState(!tokenFromParam && !!slugFromParam);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tokenFromParam) {
      setResolvedToken(tokenFromParam);
      setLoading(false);
      return;
    }

    if (slugFromParam) {
      setLoading(true);
      api
        .getMyProjects()
        .then(({ projects }) => {
          const match = projects.find(
            (p) => slugify(p.company_name) === slugFromParam || p.token === slugFromParam
          );
          if (match) {
            setResolvedToken(match.token);
          } else {
            setError("Project not found.");
          }
        })
        .catch(() => setError("Failed to load projects."))
        .finally(() => setLoading(false));
    }
  }, [tokenFromParam, slugFromParam]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || (!resolvedToken && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted-foreground">{error || "No project token or slug provided."}</p>
      </div>
    );
  }

  return <ProjectDetail token={resolvedToken!} />;
}

export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DetailResolver />
    </Suspense>
  );
}
