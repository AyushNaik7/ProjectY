"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/ClerkAuthContext";
import {
  LandingPageHeader,
  HeroSection,
  TrustSection,
  FeaturesSection,
  WorkflowSection,
  DashboardPreviewSection,
  AIFeaturesSection,
  CTASection,
  Footer,
} from "@/components/landing";

const creatorSteps = ["Create your profile", "Get AI matches", "Apply and collaborate"];
const brandSteps = ["Create a campaign", "Review matched creators", "Approve and launch"];

export default function HomePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && role === "creator") router.push("/dashboard/creator");
    if (!loading && user && role === "brand") router.push("/dashboard/brand");
    if (!loading && user && !role) router.push("/role-select");
  }, [loading, user, role, router]);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  // Redirect authenticated users (handled in useEffect)
  if (user) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  // Show landing page for unauthenticated users
  return (
    <div className="bg-slate-950">
      <LandingPageHeader />
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <WorkflowSection />
      <DashboardPreviewSection />
      <AIFeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
