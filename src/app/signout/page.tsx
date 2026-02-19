"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";

export default function SignOutPage() {
  const router = useRouter();
  const { signOut } = useSupabaseAuth();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut();
        // Clear any local storage
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to home
        router.push("/");
      } catch (error) {
        console.error("Error signing out:", error);
        router.push("/");
      }
    };

    handleSignOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
}
