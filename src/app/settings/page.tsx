"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
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
import { Settings, Loader2, LogOut, IndianRupee, AlertCircle } from "lucide-react";

const CATEGORY_OPTIONS = [
  "D2C / E-commerce",
  "Fashion & Apparel",
  "Food & Beverages",
  "Health & Wellness",
  "Tech & SaaS",
  "Education & EdTech",
  "Finance & FinTech",
  "Beauty & Personal Care",
  "Travel & Hospitality",
  "Real Estate",
  "Automotive",
  "Entertainment & Media",
  "Gaming",
  "Non-Profit / NGO",
  "Other",
];

interface BrandSettings {
  name: string;
  category: string;
  budget_min: number;
  budget_max: number;
}

export default function SettingsPage() {
  const [formData, setFormData] = useState<BrandSettings>({
    name: "",
    category: "",
    budget_min: 0,
    budget_max: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { user, role, loading: authLoading, signOut } = useSupabaseAuth();

  // Redirect guards
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (role !== "brand") {
      router.push("/dashboard/creator");
    }
  }, [user, role, authLoading, router]);

  // Load brand settings
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("brands")
          .select("name, category, budget_min, budget_max")
          .eq("id", user.id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setFormData({
            name: data.name || "",
            category: data.category || "",
            budget_min: data.budget_min || 0,
            budget_max: data.budget_max || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        setError("Failed to load your settings. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("budget") ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSuccess("");
    setSaving(true);

    // Validation
    if (!formData.name.trim()) {
      setError("Brand name is required.");
      setSaving(false);
      return;
    }

    if (!formData.category) {
      setError("Category is required.");
      setSaving(false);
      return;
    }

    if (formData.budget_max < formData.budget_min) {
      setError("Maximum budget must be greater than or equal to minimum budget.");
      setSaving(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("brands")
        .update({
          name: formData.name.trim(),
          category: formData.category,
          budget_min: formData.budget_min,
          budget_max: formData.budget_max,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setSignOutLoading(true);
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Failed to logout. Please try again.");
      setSignOutLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== "brand") return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your brand account and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Brand Profile</CardTitle>
              <CardDescription>
                Update your brand information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Brand Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Brand Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your brand or company name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-border/50"
                    disabled={saving}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Industry Category
                  </Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={saving}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select your industry</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Range */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Budget Preference</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="budget_min"
                        className="text-xs text-muted-foreground flex items-center gap-1"
                      >
                        <IndianRupee className="w-3 h-3" /> Min Budget
                      </Label>
                      <Input
                        id="budget_min"
                        name="budget_min"
                        type="number"
                        placeholder="5000"
                        value={formData.budget_min || ""}
                        onChange={handleChange}
                        className="border-border/50"
                        disabled={saving}
                        min={0}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="budget_max"
                        className="text-xs text-muted-foreground flex items-center gap-1"
                      >
                        <IndianRupee className="w-3 h-3" /> Max Budget
                      </Label>
                      <Input
                        id="budget_max"
                        name="budget_max"
                        type="number"
                        placeholder="50000"
                        value={formData.budget_max || ""}
                        onChange={handleChange}
                        className="border-border/50"
                        disabled={saving}
                        min={0}
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="flex gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white text-sm">
                      ✓
                    </div>
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Actions Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Email Display */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground break-words">
                  {user?.email || "N/A"}
                </p>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                disabled={signOutLoading}
                variant="outline"
                className="w-full gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                {signOutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </>
                )}
              </Button>

              {/* Info Card */}
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-2">
                <p className="text-xs font-medium text-blue-700">Pro Tip</p>
                <p className="text-xs text-muted-foreground">
                  Your brand profile helps creators understand your requirements and match them accurately.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
