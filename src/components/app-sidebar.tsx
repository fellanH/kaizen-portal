"use client";

import { useState, useEffect } from "react";
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
import { useProjects } from "@/lib/projects-context";
import { FolderKanban, MessageSquare, User, LogOut, Sun, Moon } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const { email, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { projects } = useProjects();

  useEffect(() => setMounted(true), []);

  const navItems = [
    {
      title: "Projects",
      href: "/projects",
      icon: FolderKanban,
      badge: projects.length || null,
    },
    { title: "Messages", href: "/messages", icon: MessageSquare, badge: null },
    { title: "Account", href: "/account", icon: User, badge: null },
  ];

  const emailPrefix = email?.split("@")[0] || "";
  const nameParts = emailPrefix.split(/[._-]/).filter(Boolean);
  const initials = nameParts.length > 0
    ? nameParts.length === 1
      ? nameParts[0][0]?.toUpperCase() || "?"
      : (nameParts[0][0]?.toUpperCase() + nameParts[nameParts.length - 1][0]?.toUpperCase()) || "?"
    : "?";
  const displayName = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-5 py-6">
        <Link href="/projects" className="flex items-center gap-3">
          {/* Kaizen K mark */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="4" fill="currentColor" className="text-primary" />
            <g clipPath="url(#k-mark-clip)">
              <path d="M7.27295 4.36377V27.6365H9.21329V4.36377" fill="var(--background, #fafafa)"/>
              <path d="M14.3838 4.36377L11.9583 15.2804C11.8541 15.7542 11.8541 16.2438 11.9583 16.7176L14.3838 27.6342H12.2281L9.99306 16.6586C9.90466 16.2234 9.90466 15.7723 9.99306 15.3371L12.2281 4.36377" fill="var(--background, #fafafa)"/>
              <path d="M19.5566 4.36377L14.9777 15.1104C14.7352 15.6771 14.7352 16.3186 14.9777 16.8876L19.5566 27.6342H17.4009L12.822 16.8876C12.5795 16.3209 12.5795 15.6794 12.822 15.1104L17.4009 4.36377" fill="var(--background, #fafafa)"/>
              <path d="M24.7269 4.36377L18.1602 14.7931C17.6955 15.532 17.6955 16.4705 18.1602 17.2094L24.7269 27.6388H22.7866L16.043 17.2366C15.5579 16.4864 15.5579 15.5207 16.043 14.7704L22.7866 4.36377" fill="var(--background, #fafafa)"/>
            </g>
            <defs>
              <clipPath id="k-mark-clip">
                <rect width="17.454" height="23.2727" fill="white" transform="translate(7.27295 4.36377)"/>
              </clipPath>
            </defs>
          </svg>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-lg font-light tracking-tight text-foreground"
              style={{ letterSpacing: "-0.03em", fontFamily: "var(--font-aspekta)" }}
            >
              Kaizen
            </span>
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/40">
              Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-5 text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/40">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={
                      item.href === "/projects"
                        ? pathname === "/projects" || pathname.startsWith("/projects/") || pathname.startsWith("/project/")
                        : pathname.startsWith(item.href)
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1 text-sm font-light">{item.title}</span>
                    {item.badge !== null && item.badge > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[0.6rem] font-medium text-primary">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support section */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="px-5 text-[0.55rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/40">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-5 py-2">
              <p className="text-xs leading-[1.6] text-muted-foreground/60">
                Questions about your project? Reach out anytime.
              </p>
              <a
                href="mailto:hello@hi-kaizen.com"
                className="group mt-1.5 inline-block text-xs text-primary transition-colors duration-200 hover:text-primary/80"
              >
                <span className="relative">
                  hello@hi-kaizen.com
                  <span className="absolute inset-x-0 -bottom-px h-px bg-primary/30 transition-transform duration-300 origin-left scale-x-100 group-hover:scale-x-0" />
                </span>
              </a>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-light text-foreground/90">
              {displayName}
            </span>
            <span className="block truncate text-[0.6rem] text-muted-foreground/50">
              {email}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-1.5 text-muted-foreground/60 transition-colors duration-200 hover:text-foreground"
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
              className="rounded-md p-1.5 text-muted-foreground/60 transition-colors duration-200 hover:text-foreground"
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
