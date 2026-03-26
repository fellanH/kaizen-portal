"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {isMobile && (
            <header className="flex h-12 items-center gap-2 border-b border-border px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm font-semibold text-primary">Kaizen</span>
            </header>
          )}
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
