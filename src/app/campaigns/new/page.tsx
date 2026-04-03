"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Megaphone, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/ClerkAuthContext";
import { callCreateCampaign } from "@/lib/functions";

const NICHE_OPTIONS = [
  "Fashion & Lifestyle",
  "Tech & Gadgets",
  "Beauty & Skincare",
  "Travel & Adventure",
  "Food & Cooking",
  "Fitness & Health",
  "Gaming",
  "Education & Learning",
  "Finance & Business",
  "Entertainment & Comedy",
  "Art & Design",
  "Music",
  "Automotive",
  "Any",
];

export default function PostCampaignPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deliverable: "",
    budget: "",
    timeline: "",
    niche: "",
  });

  useEffect(() => {
    if (!authLoading && (!user || role !== "brand")) {
      router.push("/login");
    }
  }, [authLoading, user, role, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || role !== "brand") {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const deliverableMap: Record<string, "Reel" | "Post" | "Story"> = {
        reel: "Reel",
        post: "Post",
        story: "Story",
        tiktok: "Reel",
        youtube: "Reel",
        "youtube-short": "Reel",
      };

      await callCreateCampaign({
        title: formData.title.trim(),
        description: formData.description.trim(),
        deliverableType: deliverableMap[formData.deliverable] || "Reel",
        budget: parseInt(formData.budget),
        timeline: formData.timeline,
        niche: formData.niche,
      });

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/brand"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.title.trim().length >= 3 &&
    formData.description.trim().length >= 10 &&
    formData.deliverable &&
    formData.budget &&
    parseInt(formData.budget) > 0 &&
    formData.timeline &&
    formData.niche;

  if (success) {
    return (
      <DashboardShell role="brand">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center py-20"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Campaign Published!
          </h2>
          <p className="text-muted-foreground">
            Your campaign is now live. AI is matching creators for you.
          </p>
        </motion.div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="brand">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-4"
      >
        <Link href="/dashboard/brand">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Megaphone className="w-7 h-7 text-primary" />
            Post a New Campaign
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details and reach matched creators instantly
          </p>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-2xl"
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Provide information about your campaign to attract the right
              creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Campaign Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Summer Collection Launch"
                  value={formData.title}
                  onChange={handleChange}
                  className="border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your campaign, target audience, and key message..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="border-border/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Deliverable Type
                  </Label>
                  <Select
                    value={formData.deliverable}
                    onValueChange={(v) => handleSelectChange("deliverable", v)}
                  >
                    <SelectTrigger className="border-border/50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reel">Instagram Reel</SelectItem>
                      <SelectItem value="post">Instagram Post</SelectItem>
                      <SelectItem value="story">Instagram Story</SelectItem>
                      <SelectItem value="tiktok">TikTok Video</SelectItem>
                      <SelectItem value="youtube">YouTube Video</SelectItem>
                      <SelectItem value="youtube-short">
                        YouTube Short
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Niche / Category
                  </Label>
                  <Select
                    value={formData.niche}
                    onValueChange={(v) => handleSelectChange("niche", v)}
                  >
                    <SelectTrigger className="border-border/50">
                      <SelectValue placeholder="Select niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium">
                    Budget (\u20B9)
                  </Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.budget}
                    onChange={handleChange}
                    min={0}
                    className="border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Timeline</Label>
                  <Select
                    value={formData.timeline}
                    onValueChange={(v) => handleSelectChange("timeline", v)}
                  >
                    <SelectTrigger className="border-border/50">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 Day">1 Day</SelectItem>
                      <SelectItem value="2 Days">2 Days</SelectItem>
                      <SelectItem value="3 Days">3 Days</SelectItem>
                      <SelectItem value="1 Week">1 Week</SelectItem>
                      <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                      <SelectItem value="1 Month">1 Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Link href="/dashboard/brand" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Campaign"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardShell>
  );
}
