"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useProjects } from "@/lib/projects-context";
import { slugify } from "@/lib/slugify";
import { ProjectDetail } from "../detail/project-detail";

export function SlugResolver({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const urlSlug = slug[0] || "";
  const router = useRouter();
  const { projects, loading } = useProjects();
  const [resolvedToken, setResolvedToken] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Handle legacy hash-based URLs: /projects/detail#token
  useEffect(() => {
    if (urlSlug === "detail" && typeof window !== "undefined") {
      const hash = window.location.hash.slice(1).split("#")[0];
      if (hash && projects.length > 0) {
        const project = projects.find((p) => p.token === hash);
        if (project) {
          router.replace(`/projects/${slugify(project.company_name)}`);
          return;
        }
      }
      if (hash && !loading) {
        api
          .getProject(hash)
          .then((p) => {
            router.replace(`/projects/${slugify(p.company_name)}`);
          })
          .catch(() => setNotFound(true));
      }
    }
  }, [urlSlug, projects, loading, router]);

  // Resolve slug to token
  useEffect(() => {
    if (urlSlug === "detail") return;
    if (loading) return;

    const match = projects.find(
      (p) => slugify(p.company_name) === urlSlug
    );
    if (match) {
      setResolvedToken(match.token);
    } else {
      setNotFound(true);
    }
  }, [urlSlug, projects, loading]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  if (loading || (!resolvedToken && urlSlug !== "detail")) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (resolvedToken) {
    return <ProjectDetail token={resolvedToken} />;
  }

  return null;
}
