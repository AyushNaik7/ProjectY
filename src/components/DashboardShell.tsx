"use client";

import { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface DashboardShellProps {
  children: ReactNode;
  role?: string;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
