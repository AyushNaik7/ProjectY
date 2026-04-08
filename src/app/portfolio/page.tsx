"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/ClerkAuthContext";

export default function PortfolioPage() {
  const router = useRouter();
  const { role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (role === "brand") {
      router.replace("/saved/creators");
      return;
    }

    router.replace("/saved/campaigns");
  }, [loading, role, router]);

  return null;
}
