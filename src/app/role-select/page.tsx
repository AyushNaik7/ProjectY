"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Users, Briefcase, ArrowRight } from "lucide-react";

export default function RoleSelectPage() {
  const router = useRouter();
  const { user, setRole, loading } = useSupabaseAuth();

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (loading) return;
    
    // If not logged in, go to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If user already has a role in metadata or localStorage, redirect to the appropriate page
    const metaRole = (user.user_metadata as any)?.role as
      | "creator"
      | "brand"
      | undefined;
    const onboardingComplete = (user.user_metadata as any)?.onboarding_complete;
    const savedRole =
      (metaRole as "creator" | "brand") ||
      (localStorage.getItem("userRole") as "creator" | "brand" | null);
    if (savedRole === "creator") {
      router.push(onboardingComplete ? "/dashboard/creator" : "/onboarding/creator");
    } else if (savedRole === "brand") {
      router.push(onboardingComplete ? "/dashboard/brand" : "/onboarding/brand");
    }
  }, [user, router, loading]);

  const handleSelectRole = async (selectedRole: "creator" | "brand") => {
    await setRole(selectedRole);
    // Redirect to onboarding so the user completes their profile
    if (selectedRole === "creator") {
      router.push("/onboarding/creator");
    } else {
      router.push("/onboarding/brand");
    }
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Collabo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold tracking-tight hidden sm:block">
              Collabo
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select whether you&apos;re a creator looking for brand deals or a
            brand seeking creators.
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Creator Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -8 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 flex flex-col items-center text-center h-full justify-between">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    I&apos;m a Creator
                  </h2>
                  <p className="text-muted-foreground">
                    Find brand deals, collaborate with premium brands, and earn
                    what you deserve.
                  </p>
                </div>

                <div className="w-full">
                  <Button
                    onClick={() => handleSelectRole("creator")}
                    size="lg"
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                  >
                    Continue as Creator
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Brand Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full bg-gradient-to-br from-blue-500/5 to-blue-600/10">
              <CardContent className="p-8 flex flex-col items-center text-center h-full justify-between">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    I&apos;m a Brand
                  </h2>
                  <p className="text-muted-foreground">
                    Post campaigns, find creators, and manage collaborations all
                    in one place.
                  </p>
                </div>

                <div className="w-full">
                  <Button
                    onClick={() => handleSelectRole("brand")}
                    size="lg"
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Continue as Brand
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
