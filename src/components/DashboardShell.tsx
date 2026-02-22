"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sparkles,
  LayoutDashboard,
  Megaphone,
  Send,
  LogOut,
  Plus,
  User,
  Users,
  Settings,
  Bookmark,
} from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
  role?: string;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const { signOut, role } = useSupabaseAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navItems =
    role === "brand"
      ? [
          {
            href: "/dashboard/brand",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { href: "/campaigns", label: "Campaigns", icon: Megaphone },
          { href: "/campaigns/new", label: "New Campaign", icon: Plus },
          { href: "/creators", label: "Find Creators", icon: Users },
          { href: "/requests", label: "Requests", icon: Send },
          { href: "/saved/creators", label: "Saved", icon: Bookmark },
        ]
      : [
          {
            href: "/dashboard/creator",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { href: "/campaigns", label: "Find Campaigns", icon: Megaphone },
          { href: "/requests", label: "My Requests", icon: Send },
          { href: "/saved/campaigns", label: "Saved", icon: Bookmark },
        ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Collabo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-bold tracking-tight hidden sm:block">
                Collabo
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <User className="w-3.5 h-3.5" />
              <span className="text-muted-foreground capitalize">{role}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border/50 px-4 py-2 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs whitespace-nowrap"
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
