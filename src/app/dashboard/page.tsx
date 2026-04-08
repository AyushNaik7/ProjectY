"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/ClerkAuthContext";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (role === "brand") {
      router.replace("/dashboard/brand");
      return;
    }

    router.replace("/dashboard/creator");
  }, [loading, role, router]);

  return null;
}
