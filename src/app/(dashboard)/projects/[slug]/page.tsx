"use client";

import { use } from "react";
import { Suspense } from "react";
import { useProjects } from "@/lib/projects-context";
import { slugify } from "@/lib/slugify";
import { ProjectDetail } from "../detail/project-detail";

function SlugResolver({ slug }: { slug: string }) {
  const { projects, loading } = useProjects();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const project = projects.find((p) => slugify(p.company_name) === slug);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return <ProjectDetail token={project.token} />;
}

export default function ProjectSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SlugResolver slug={slug} />
    </Suspense>
  );
}
