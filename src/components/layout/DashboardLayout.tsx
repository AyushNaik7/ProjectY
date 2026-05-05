"use client";

import { ReactNode, useState } from "react";
import { useAuth } from "@/context/ClerkAuthContext";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  role?: string;
}

export function DashboardLayout({ children, role: dashboardRole }: DashboardLayoutProps) {
  const { role: authRole, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const metadata = (user?.user_metadata as Record<string, unknown> | undefined) || {};
  const firstName = ((metadata.first_name as string) || (metadata.firstName as string) || "").trim();
  const lastName = ((metadata.last_name as string) || (metadata.lastName as string) || "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const userName =
    ((metadata.name as string) || "").trim() ||
    fullName ||
    user?.email?.split("@")[0] ||
    "Creator";

  const safeRole = (dashboardRole || authRole) === "brand" ? "brand" : "creator";
  const isCreatorTheme = safeRole === "creator";

  const resolvedUserName = userName;

  return (
    <div
      className={
        isCreatorTheme
          ? "min-h-screen bg-[radial-gradient(circle_at_5%_10%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#050816_0%,#080b1c_45%,#090f24_100%)] text-slate-100"
          : "min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe,_#eef2ff_34%,_#f8fafc_72%)]"
      }
    >
      <TopNav onMobileMenuToggle={() => setMobileOpen(true)} />

      <div className="mx-auto flex max-w-[1600px] gap-4 px-4 py-4 md:px-8">
        <div className="hidden lg:flex lg:flex-col lg:gap-3">
          <button
            onClick={() => setCollapsed((value) => !value)}
            className={
              isCreatorTheme
                ? "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-slate-300 backdrop-blur-xl"
                : "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-600 backdrop-blur-xl"
            }
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <Sidebar role={safeRole} userName={resolvedUserName} collapsed={collapsed} />
        </div>

        <main className="flex-1 space-y-6 pb-8">
          {children}
          <Footer />
        </main>
      </div>

      {mobileOpen ? (
        <div
          className={
            isCreatorTheme
              ? "fixed inset-0 z-[60] bg-slate-950/75 p-4 lg:hidden"
              : "fixed inset-0 z-[60] bg-slate-900/45 p-4 lg:hidden"
          }
          onClick={() => setMobileOpen(false)}
        >
          <div className="h-full max-w-xs" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-end">
              <button
                onClick={() => setMobileOpen(false)}
                className={
                  isCreatorTheme
                    ? "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-slate-200"
                    : "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white text-slate-700"
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar
              role={safeRole}
              userName={resolvedUserName}
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
