"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { callCompleteBrandOnboarding } from "@/lib/functions";
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
import { Building2, ArrowRight, Loader2, IndianRupee } from "lucide-react";

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

export default function BrandOnboardingPage() {
    const [formData, setFormData] = useState({
        brandName: "",
        category: "",
        budgetMin: "",
        budgetMax: "",
        website: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { user, role, loading: authLoading, refreshProfile } = useAuth();

    // Redirect guards
    React.useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/auth?role=brand");
            return;
        }
        if (role === "creator") {
            router.push("/onboarding/creator");
        }
    }, [user, role, authLoading, router]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setError("");
        setLoading(true);

        const budgetMin = parseInt(formData.budgetMin);
        const budgetMax = parseInt(formData.budgetMax);

        if (budgetMax < budgetMin) {
            setError(
                "Maximum budget must be greater than minimum budget."
            );
            setLoading(false);
            return;
        }

        try {
            // ALL validation + Firestore writes happen server-side via Cloud Function
            await callCompleteBrandOnboarding({
                brandName: formData.brandName.trim(),
                category: formData.category,
                budgetMin,
                budgetMax,
                website: formData.website.trim() || undefined,
                description: formData.description.trim() || undefined,
            });

            await refreshProfile();
            router.push("/dashboard/brand");
        } catch (err: unknown) {
            const fnError = err as { message?: string };
            console.error("Brand onboarding error:", err);
            setError(
                fnError.message ||
                "Failed to save profile. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative">
            <div className="fixed inset-0 gradient-mesh pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl relative z-10"
            >
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Building2 className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">
                            Set up your Brand profile
                        </CardTitle>
                        <CardDescription>
                            Tell us about your brand to start posting campaigns
                            and finding creators.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="brandName">Brand Name</Label>
                                <Input
                                    id="brandName"
                                    name="brandName"
                                    placeholder="Your brand or company name"
                                    value={formData.brandName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">
                                    Industry Category
                                </Label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
                                >
                                    <option value="">
                                        Select your industry
                                    </option>
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">
                                    Website (optional)
                                </Label>
                                <Input
                                    id="website"
                                    name="website"
                                    type="url"
                                    placeholder="https://yourbrand.com"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="budgetMin"
                                        className="flex items-center gap-1.5"
                                    >
                                        <IndianRupee className="w-3.5 h-3.5" />{" "}
                                        Min Budget (₹)
                                    </Label>
                                    <Input
                                        id="budgetMin"
                                        name="budgetMin"
                                        type="number"
                                        placeholder="5000"
                                        value={formData.budgetMin}
                                        onChange={handleChange}
                                        required
                                        min={0}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="budgetMax"
                                        className="flex items-center gap-1.5"
                                    >
                                        <IndianRupee className="w-3.5 h-3.5" />{" "}
                                        Max Budget (₹)
                                    </Label>
                                    <Input
                                        id="budgetMax"
                                        name="budgetMax"
                                        type="number"
                                        placeholder="50000"
                                        value={formData.budgetMax}
                                        onChange={handleChange}
                                        required
                                        min={0}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Brand Description (optional)
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Brief description of your brand and what you do..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                Complete Profile
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
