"use client";

import { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface DashboardShellProps {
  children: ReactNode;
  role?: string;
}

export default function DashboardShell({ children, role }: DashboardShellProps) {
  return <DashboardLayout role={role}>{children}</DashboardLayout>;
}
