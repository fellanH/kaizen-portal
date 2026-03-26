"use client";

import { Suspense } from "react";
import { ProjectDetail } from "./project-detail";

export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ProjectDetail />
    </Suspense>
  );
}
