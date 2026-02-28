"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/ClerkAuthContext";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings,
  Loader2,
  LogOut,
  IndianRupee,
  AlertCircle,
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Mail,
  Shield,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { useTheme } from "@/context/ThemeContext";

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

const NICHE_OPTIONS = [
  "Fashion & Lifestyle",
  "Tech & Gadgets",
  "Food & Cooking",
  "Travel & Adventure",
  "Fitness & Health",
  "Beauty & Makeup",
  "Gaming & Esports",
  "Education & Learning",
  "Finance & Investment",
  "Entertainment & Comedy",
  "Music & Dance",
  "Art & Design",
  "Business & Entrepreneurship",
  "Parenting & Family",
  "Other",
];

interface BrandSettings {
  name: string;
  category: string;
  budget_min: number;
  budget_max: number;
  website?: string;
  description?: string;
}

interface CreatorSettings {
  name: string;
  username: string;
  niche: string;
  bio?: string;
  instagram_handle?: string;
  youtube_handle?: string;
  followers: number;
  avg_views: number;
  engagement_rate: number;
}

interface NotificationSettings {
  email_notifications: boolean;
  new_matches: boolean;
  request_updates: boolean;
  marketing_emails: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "appearance" | "account">("profile");
  const [brandData, setBrandData] = useState<BrandSettings>({
    name: "",
    category: "",
    budget_min: 0,
    budget_max: 0,
    website: "",
    description: "",
  });
  const [creatorData, setCreatorData] = useState<CreatorSettings>({
    name: "",
    username: "",
    niche: "",
    bio: "",
    instagram_handle: "",
    youtube_handle: "",
    followers: 0,
    avg_views: 0,
    engagement_rate: 0,
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    new_matches: true,
    request_updates: true,
    marketing_emails: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { user, role, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Redirect guards
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  // Load settings
  useEffect(() => {
    if (!user || !role) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        if (role === "brand") {
          const { data, error: fetchError } = await supabase
            .from("brands")
            .select("*")
            .eq("id", user.id)
            .single();

          if (fetchError) throw fetchError;
          if (data) {
            setBrandData({
              name: data.name || "",
              category: data.category || "",
              budget_min: data.budget_min || 0,
              budget_max: data.budget_max || 0,
              website: data.website || "",
              description: data.description || "",
            });
          }
        } else if (role === "creator") {
          const { data, error: fetchError } = await supabase
            .from("creators")
            .select("*")
            .eq("id", user.id)
            .single();

          if (fetchError) throw fetchError;
          if (data) {
            setCreatorData({
              name: data.name || "",
              username: data.username || "",
              niche: data.niche || "",
              bio: data.bio || "",
              instagram_handle: data.instagram_handle || "",
              youtube_handle: data.youtube_handle || "",
              followers: data.followers || 0,
              avg_views: data.avg_views || 0,
              engagement_rate: data.engagement_rate || 0,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        setError("Failed to load your settings. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user, role]);

  const handleBrandChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBrandData((prev) => ({
      ...prev,
      [name]: name.includes("budget") ? parseInt(value) || 0 : value,
    }));
  };

  const handleCreatorChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCreatorData((prev) => ({
      ...prev,
      [name]: ["followers", "avg_views", "engagement_rate"].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const supabase = createClient();

      if (role === "brand") {
        // Validation
        if (!brandData.name.trim()) {
          setError("Brand name is required.");
          setSaving(false);
          return;
        }
        if (!brandData.category) {
          setError("Category is required.");
          setSaving(false);
          return;
        }
        if (brandData.budget_max < brandData.budget_min) {
          setError("Maximum budget must be greater than or equal to minimum budget.");
          setSaving(false);
          return;
        }

        const { error: updateError } = await supabase
          .from("brands")
          .update({
            name: brandData.name.trim(),
            category: brandData.category,
            budget_min: brandData.budget_min,
            budget_max: brandData.budget_max,
            website: brandData.website?.trim() || null,
            description: brandData.description?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) throw updateError;
      } else if (role === "creator") {
        // Validation
        if (!creatorData.name.trim()) {
          setError("Name is required.");
          setSaving(false);
          return;
        }
        if (!creatorData.username.trim()) {
          setError("Username is required.");
          setSaving(false);
          return;
        }
        if (!creatorData.niche) {
          setError("Niche is required.");
          setSaving(false);
          return;
        }

        const { error: updateError } = await supabase
          .from("creators")
          .update({
            name: creatorData.name.trim(),
            username: creatorData.username.trim().toLowerCase(),
            niche: creatorData.niche,
            bio: creatorData.bio?.trim() || null,
            instagram_handle: creatorData.instagram_handle?.trim() || null,
            youtube_handle: creatorData.youtube_handle?.trim() || null,
            followers: creatorData.followers,
            avg_views: creatorData.avg_views,
            engagement_rate: creatorData.engagement_rate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) throw updateError;
      }

      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      if (err.message?.includes("duplicate") || err.code === "23505") {
        setError("Username already taken. Please choose another.");
      } else {
        setError("Failed to save settings. Please try again.");
      }
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
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "account", label: "Account", icon: Shield },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>{role === "brand" ? "Brand" : "Creator"} Profile</CardTitle>
                    <CardDescription>
                      Update your {role === "brand" ? "brand" : "creator"} information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {role === "brand" ? (
                        <>
                          {/* Brand Name */}
                          <div className="space-y-2">
                            <Label htmlFor="name">Brand Name</Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="Your brand name"
                              value={brandData.name}
                              onChange={handleBrandChange}
                              disabled={saving}
                            />
                          </div>

                          {/* Category */}
                          <div className="space-y-2">
                            <Label htmlFor="category">Industry Category</Label>
                            <select
                              id="category"
                              name="category"
                              value={brandData.category}
                              onChange={handleBrandChange}
                              disabled={saving}
                              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <option value="">Select category</option>
                              {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Website */}
                          <div className="space-y-2">
                            <Label htmlFor="website">Website (Optional)</Label>
                            <Input
                              id="website"
                              name="website"
                              type="url"
                              placeholder="https://yourbrand.com"
                              value={brandData.website}
                              onChange={handleBrandChange}
                              disabled={saving}
                            />
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                              id="description"
                              name="description"
                              placeholder="Tell creators about your brand..."
                              value={brandData.description}
                              onChange={handleBrandChange}
                              disabled={saving}
                              rows={4}
                            />
                          </div>

                          {/* Budget Range */}
                          <div className="space-y-4">
                            <Label>Budget Preference</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="budget_min" className="text-xs text-muted-foreground flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" /> Min Budget
                                </Label>
                                <Input
                                  id="budget_min"
                                  name="budget_min"
                                  type="number"
                                  placeholder="5000"
                                  value={brandData.budget_min || ""}
                                  onChange={handleBrandChange}
                                  disabled={saving}
                                  min={0}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="budget_max" className="text-xs text-muted-foreground flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" /> Max Budget
                                </Label>
                                <Input
                                  id="budget_max"
                                  name="budget_max"
                                  type="number"
                                  placeholder="50000"
                                  value={brandData.budget_max || ""}
                                  onChange={handleBrandChange}
                                  disabled={saving}
                                  min={0}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Creator Name */}
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="Your name"
                              value={creatorData.name}
                              onChange={handleCreatorChange}
                              disabled={saving}
                            />
                          </div>

                          {/* Username */}
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              name="username"
                              placeholder="username"
                              value={creatorData.username}
                              onChange={handleCreatorChange}
                              disabled={saving}
                            />
                            <p className="text-xs text-muted-foreground">
                              Your public profile URL: /creators/{creatorData.username || "username"}
                            </p>
                          </div>

                          {/* Niche */}
                          <div className="space-y-2">
                            <Label htmlFor="niche">Niche</Label>
                            <select
                              id="niche"
                              name="niche"
                              value={creatorData.niche}
                              onChange={handleCreatorChange}
                              disabled={saving}
                              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <option value="">Select niche</option>
                              {NICHE_OPTIONS.map((niche) => (
                                <option key={niche} value={niche}>
                                  {niche}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Bio */}
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio (Optional)</Label>
                            <Textarea
                              id="bio"
                              name="bio"
                              placeholder="Tell brands about yourself..."
                              value={creatorData.bio}
                              onChange={handleCreatorChange}
                              disabled={saving}
                              rows={4}
                            />
                          </div>

                          {/* Social Handles */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="instagram_handle">Instagram Handle</Label>
                              <Input
                                id="instagram_handle"
                                name="instagram_handle"
                                placeholder="username"
                                value={creatorData.instagram_handle}
                                onChange={handleCreatorChange}
                                disabled={saving}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="youtube_handle">YouTube Handle</Label>
                              <Input
                                id="youtube_handle"
                                name="youtube_handle"
                                placeholder="@username"
                                value={creatorData.youtube_handle}
                                onChange={handleCreatorChange}
                                disabled={saving}
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="followers">Followers</Label>
                              <Input
                                id="followers"
                                name="followers"
                                type="number"
                                placeholder="10000"
                                value={creatorData.followers || ""}
                                onChange={handleCreatorChange}
                                disabled={saving}
                                min={0}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="avg_views">Avg Views</Label>
                              <Input
                                id="avg_views"
                                name="avg_views"
                                type="number"
                                placeholder="5000"
                                value={creatorData.avg_views || ""}
                                onChange={handleCreatorChange}
                                disabled={saving}
                                min={0}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="engagement_rate">Engagement %</Label>
                              <Input
                                id="engagement_rate"
                                name="engagement_rate"
                                type="number"
                                step="0.1"
                                placeholder="3.5"
                                value={creatorData.engagement_rate || ""}
                                onChange={handleCreatorChange}
                                disabled={saving}
                                min={0}
                                max={100}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Error/Success Messages */}
                      {error && (
                        <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}

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
                        className="w-full gap-2"
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
            )}

            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries({
                      email_notifications: "Email Notifications",
                      new_matches: "New Match Alerts",
                      request_updates: "Request Status Updates",
                      marketing_emails: "Marketing & Promotions",
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            {key === "email_notifications" && "Receive email notifications"}
                            {key === "new_matches" && "Get notified about new matches"}
                            {key === "request_updates" && "Updates on collaboration requests"}
                            {key === "marketing_emails" && "Tips, news, and special offers"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key as keyof NotificationSettings)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications[key as keyof NotificationSettings]
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications[key as keyof NotificationSettings]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how Collabo looks for you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="mb-4 block">Theme</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => theme === "dark" && toggleTheme()}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            theme === "light"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="w-full h-20 bg-white rounded mb-3 border"></div>
                          <p className="font-medium">Light</p>
                        </button>
                        <button
                          onClick={() => theme === "light" && toggleTheme()}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            theme === "dark"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="w-full h-20 bg-gray-900 rounded mb-3 border"></div>
                          <p className="font-medium">Dark</p>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "account" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Email Address</Label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{user?.email}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Account Type</Label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{role}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-xs font-medium text-blue-700 mb-2">💡 Pro Tip</p>
                  <p className="text-xs text-muted-foreground">
                    {role === "brand"
                      ? "Complete your profile to get better creator matches and increase collaboration success."
                      : "Keep your stats updated to attract more brand collaborations and get accurate match scores."}
                  </p>
                </div>

                {role === "creator" && creatorData.username && (
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <p className="text-xs font-medium text-green-700 mb-2">🔗 Your Public Profile</p>
                    <a
                      href={`/creators/${creatorData.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      /creators/{creatorData.username}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
