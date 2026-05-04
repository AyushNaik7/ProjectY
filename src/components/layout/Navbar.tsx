"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { useAuth } from "@/context/ClerkAuthContext";
import { UserAvatar } from "@/components/ui/user-avatar";

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

interface AppNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  href: string;
}

const notificationsSeed: AppNotification[] = [
  {
    id: "n1",
    title: "New collaboration request",
    detail: "A campaign wants a proposal from you.",
    time: "2m ago",
    unread: true,
    href: "/requests",
  },
  {
    id: "n2",
    title: "Performance alert",
    detail: "Your campaign CTR is up by 11% this week.",
    time: "1h ago",
    unread: true,
    href: "/analytics",
  },
  {
    id: "n3",
    title: "Profile recommendation",
    detail: "Complete your portfolio to improve matching quality.",
    time: "Yesterday",
    unread: false,
    href: "/portfolio",
  },
];

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut } = useAuth();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(notificationsSeed);

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const currentLabel = useMemo(() => {
    if (pathname?.startsWith("/campaigns")) return "Campaigns";
    if (pathname?.startsWith("/requests")) return "Requests";
    if (pathname?.startsWith("/messages")) return "Messages";
    if (pathname?.startsWith("/portfolio")) return "Portfolio";
    if (pathname?.startsWith("/analytics")) return "Analytics";
    if (pathname?.startsWith("/settings")) return "Settings";
    return "Dashboard";
  }, [pathname]);

  const metadata = (user?.user_metadata as Record<string, unknown> | undefined) || {};
  const firstName = ((metadata.first_name as string) || (metadata.firstName as string) || "").trim();
  const lastName = ((metadata.last_name as string) || (metadata.lastName as string) || "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const userName =
    ((metadata.name as string) || "").trim() ||
    fullName ||
    user?.email?.split("@")[0] ||
    "Creator";

  const handleNotificationClick = (id: string, href: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
    setOpenNotifications(false);
    router.push(href);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/55 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center gap-4 px-4 md:px-8">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-xl border border-white/15 bg-white/10 p-2 text-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-lg shadow-violet-500/35">
            IC
          </span>
          <div className="hidden sm:block">
            <p className="text-sm text-slate-400">InstaCollab</p>
            <p className="text-base font-semibold text-slate-100">{currentLabel}</p>
          </div>
        </Link>

        <div className="mx-auto hidden w-full max-w-xl md:block">
          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 shadow-[0_10px_28px_rgba(13,18,45,0.45)]">
            <Search className="h-4 w-4 text-slate-400/90" />
            <input
              placeholder="Search campaigns, creators, requests..."
              className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setOpenNotifications((value) => !value);
                setOpenProfile(false);
              }}
              className="relative rounded-xl border border-white/15 bg-white/10 p-2.5 text-slate-200 transition-colors hover:text-violet-200"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-1.5 text-xs font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            <AnimatePresence>
              {openNotifications ? (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-white/15 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="mb-2 flex items-center justify-between px-2 py-1">
                    <p className="text-sm font-semibold text-slate-100">Notifications</p>
                    <button
                      onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
                      className="text-xs text-violet-300"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id, notification.href)}
                        className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/10"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-100">{notification.title}</p>
                          <span className="text-xs text-slate-500">{notification.time}</span>
                        </div>
                        <p className="text-xs text-slate-400">{notification.detail}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setOpenProfile((value) => !value);
                setOpenNotifications(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2 py-1.5"
            >
              <UserAvatar name={userName} size="sm" />
              <span className="hidden text-sm font-medium text-slate-100 md:block">{userName}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            <AnimatePresence>
              {openProfile ? (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-white/15 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="mb-2 rounded-xl bg-white/10 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-100">{userName}</p>
                    <p className="text-xs capitalize text-slate-400">{role || "member"}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-300 transition-colors hover:bg-red-500/15"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
