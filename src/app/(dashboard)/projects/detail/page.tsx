"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProjectDetail } from "./project-detail";

function DetailResolver() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted-foreground">No project token provided.</p>
      </div>
    );
  }

  return <ProjectDetail token={token} />;
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
