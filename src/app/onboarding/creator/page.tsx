"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/ClerkAuthContext";
import { callCompleteCreatorOnboarding } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Instagram,
  ArrowRight,
  Loader2,
  IndianRupee,
  TrendingUp,
  Eye,
  BarChart3,
} from "lucide-react";

const NICHE_OPTIONS = [
  "Fashion & Lifestyle",
  "Tech & Gadgets",
  "Food & Cooking",
  "Travel & Adventure",
  "Beauty & Skincare",
  "Fitness & Health",
  "Education & Learning",
  "Gaming",
  "Finance & Business",
  "Entertainment & Comedy",
  "Photography & Art",
  "Music & Dance",
  "Parenting & Family",
];

export default function CreatorOnboardingPage() {
  const [formData, setFormData] = useState({
    name: "",
    instagramHandle: "",
    niche: "",
    followers: "",
    avgViews: "",
    engagementRate: "",
    minRatePrivate: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for Clerk to finish loading before any checks
    if (authLoading) return;
    
    // Only redirect if definitely not authenticated after loading completes
    if (!user) {
      router.push("/login");
      return;
    }
    
    // If user has wrong role, redirect to correct onboarding
    if (role === "brand") {
      router.push("/onboarding/brand");
    }
  }, [user, role, authLoading, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guard: Don't submit if still loading or no user
    if (authLoading || !user) {
      setError("Please wait for authentication to complete");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      await callCompleteCreatorOnboarding({
        name: formData.name.trim(),
        instagramHandle: formData.instagramHandle.trim(),
        niche: formData.niche,
        followers: parseInt(formData.followers) || 0,
        avgViews: parseInt(formData.avgViews) || 0,
        engagementRate: parseFloat(formData.engagementRate) || 0,
        minRatePrivate: parseInt(formData.minRatePrivate) || 0,
      });
      router.push("/dashboard/creator");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid =
    formData.name.length >= 2 &&
    formData.instagramHandle.length >= 2 &&
    formData.niche !== "";
  const isStep2Valid =
    formData.followers !== "" &&
    formData.avgViews !== "" &&
    formData.engagementRate !== "" &&
    formData.minRatePrivate !== "";

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= 1 ? "bg-primary" : "bg-secondary"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= 2 ? "bg-primary" : "bg-secondary"
            }`}
          />
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-3">
              <User className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {step === 1 ? "Tell us about yourself" : "Your social stats"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Set up your creator profile to get matched with brands"
                : "Help us match you with the right campaigns"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name or brand name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="instagramHandle"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        Instagram Handle
                      </div>
                    </Label>
                    <Input
                      id="instagramHandle"
                      name="instagramHandle"
                      placeholder="@yourhandle"
                      value={formData.instagramHandle}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="niche"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Content Niche
                    </Label>
                    <select
                      id="niche"
                      name="niche"
                      value={formData.niche}
                      onChange={handleChange}
                      required
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="" disabled>
                        Select your niche
                      </option>
                      {NICHE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="button"
                    className="w-full h-11 gap-2"
                    disabled={!isStep1Valid}
                    onClick={() => setStep(2)}
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="followers"
                        className="text-sm font-medium mb-1.5 flex items-center gap-1.5"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                        Followers
                      </Label>
                      <Input
                        id="followers"
                        name="followers"
                        type="number"
                        min="0"
                        placeholder="e.g. 50000"
                        value={formData.followers}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="avgViews"
                        className="text-sm font-medium mb-1.5 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                        Avg Views
                      </Label>
                      <Input
                        id="avgViews"
                        name="avgViews"
                        type="number"
                        min="0"
                        placeholder="e.g. 10000"
                        value={formData.avgViews}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="engagementRate"
                      className="text-sm font-medium mb-1.5 flex items-center gap-1.5"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                      Engagement Rate (%)
                    </Label>
                    <Input
                      id="engagementRate"
                      name="engagementRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 5.2"
                      value={formData.engagementRate}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="minRatePrivate"
                      className="text-sm font-medium mb-1.5 flex items-center gap-1.5"
                    >
                      <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                      Minimum Rate (₹) — kept private
                    </Label>
                    <Input
                      id="minRatePrivate"
                      name="minRatePrivate"
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      value={formData.minRatePrivate}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This is private and only used internally for AI matching.
                      Brands will not see this.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 gap-2"
                      disabled={loading || !isStep2Valid}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          Complete Setup <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          You can update your profile anytime from your dashboard
        </p>
      </motion.div>
    </div>
  );
}
