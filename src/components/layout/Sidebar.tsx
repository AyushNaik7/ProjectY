"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  UserCircle2,
  Users,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

interface SidebarProps {
  role: "creator" | "brand";
  userName: string;
  collapsed?: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}

const sidebarLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: FolderKanban,
  },
  {
    href: "/requests",
    label: "Requests",
    icon: Users,
  },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageSquare,
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: UserCircle2,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar({
  role,
  userName,
  collapsed = false,
  mobile = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  const roleLabel = role === "brand" ? "Brand workspace" : "Creator workspace";
  const widthClass = collapsed ? "w-24" : "w-72";

  return (
    <aside
      className={`${mobile ? "flex" : "sticky top-24 hidden lg:flex"} ${widthClass} h-[calc(100vh-7rem)] flex-col rounded-3xl border border-white/60 bg-white/65 p-4 shadow-[0_16px_42px_rgba(25,44,120,0.12)] backdrop-blur-xl`}
    >
      <div className="mb-4 rounded-2xl border border-white/70 bg-gradient-to-br from-blue-600/10 to-violet-500/10 p-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={userName} size="lg" />
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">{roleLabel}</p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}/`)) ||
            (item.href === "/dashboard" && pathname?.startsWith("/dashboard"));

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all duration-300 ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4" />
              {!collapsed ? <span className="font-medium">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
          <div className="mb-2 flex items-center gap-2 text-blue-700">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold">Premium Insights</p>
          </div>
          <p className="text-xs text-slate-600">Activate deeper trend forecasting and matching intelligence.</p>
          <button className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-sm font-medium text-white transition-all hover:brightness-110">
            Upgrade
          </button>
        </div>
      ) : null}
    </aside>
  );
}
