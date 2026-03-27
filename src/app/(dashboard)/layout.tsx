"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { ErrorBoundary } from "@/components/error-boundary";
import { ProjectsProvider } from "@/lib/projects-context";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <AuthGuard>
      <ProjectsProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {isMobile && (
            <header className="flex h-12 items-center gap-3 border-b border-border/60 px-5">
              <SidebarTrigger />
              <span
                className="text-sm font-light tracking-tight text-primary"
                style={{ letterSpacing: "-0.03em", fontFamily: "var(--font-aspekta)" }}
              >
                Kaizen
              </span>
            </header>
          )}
          <ErrorBoundary>
            <main className="flex-1">{children}</main>
          </ErrorBoundary>
        </SidebarInset>
      </SidebarProvider>
      </ProjectsProvider>
    </AuthGuard>
  );
}
