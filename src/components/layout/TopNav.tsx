"use client";

import { Navbar } from "@/components/layout/Navbar";

interface TopNavProps {
  onMobileMenuToggle?: () => void;
}

export function TopNav({ onMobileMenuToggle }: TopNavProps = {}) {
  return <Navbar onMobileMenuToggle={onMobileMenuToggle || (() => undefined)} />;
}
