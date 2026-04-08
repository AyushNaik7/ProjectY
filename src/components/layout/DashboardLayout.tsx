"use client";

import { ReactNode, useState } from "react";
import { useAuth } from "@/context/ClerkAuthContext";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { role, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const userName =
    ((user?.user_metadata as Record<string, unknown> | undefined)?.name as string) ||
    user?.email ||
    "User";

  const safeRole = role === "brand" ? "brand" : "creator";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe,_#eef2ff_34%,_#f8fafc_72%)]">
      <TopNav onMobileMenuToggle={() => setMobileOpen(true)} />

      <div className="mx-auto flex max-w-[1600px] gap-4 px-4 py-4 md:px-8">
        <div className="hidden lg:flex lg:flex-col lg:gap-3">
          <button
            onClick={() => setCollapsed((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-600 backdrop-blur-xl"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <Sidebar role={safeRole} userName={userName} collapsed={collapsed} />
        </div>

        <main className="flex-1 space-y-6 pb-8">
          {children}
          <Footer />
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] bg-slate-900/45 p-4 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full max-w-xs" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-end">
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar
              role={safeRole}
              userName={userName}
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
