"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { FolderKanban, MessageSquare, User, LogOut, Sun, Moon } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const { email, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    api
      .getMyProjects()
      .then((data) => setProjectCount(data.projects.length))
      .catch(() => {});
  }, []);

  const navItems = [
    {
      title: "Projects",
      href: "/projects",
      icon: FolderKanban,
      badge: projectCount,
    },
    { title: "Messages", href: "/messages", icon: MessageSquare, badge: null },
    { title: "Account", href: "/account", icon: User, badge: null },
  ];

  /* Extract initials from email */
  const initials = email
    ? email
        .split("@")[0]
        .split(/[._-]/)
        .map((s) => s[0]?.toUpperCase() || "")
        .join("")
        .slice(0, 2)
    : "?";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <Link href="/projects" className="flex items-center gap-2.5">
          <span
            className="text-xl font-bold tracking-tight text-primary"
            style={{ letterSpacing: "-0.03em" }}
          >
            Kaizen
          </span>
          <span className="text-xs font-medium text-muted-foreground/50">
            Portal
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground/50">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge !== null && item.badge > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[0.65rem] font-semibold text-primary">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support section fills the void */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="px-4 text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground/50">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-4 py-2">
              <p className="text-xs leading-relaxed text-muted-foreground/70">
                Questions about your project? Reach out anytime.
              </p>
              <a
                href="mailto:hello@hi-kaizen.com"
                className="mt-1.5 inline-block text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                hello@hi-kaizen.com
              </a>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground/90">
              {email?.split("@")[0]}
            </span>
            <span className="block truncate text-[0.65rem] text-muted-foreground/60">
              {email}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )
              ) : (
                <span className="inline-block h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={logout}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
