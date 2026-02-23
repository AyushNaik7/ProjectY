"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Users,
  Briefcase,
  BarChart3,
  Star,
} from "lucide-react";

const features = [
  {
    title: "AI-Powered Matching",
    description:
      "Our algorithm analyzes audience, niche, engagement and content style to find your perfect match.",
    icon: Sparkles,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Verified Profiles",
    description:
      "Every creator and brand is verified to ensure authentic, professional collaborations.",
    icon: Shield,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Real-Time Analytics",
    description:
      "Track campaign performance, engagement metrics, and ROI with detailed dashboards.",
    icon: BarChart3,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Instant Payouts",
    description:
      "Creators get paid directly within 48 hours of content delivery. No hassle.",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-600",
  },
];

const stats = [
  { label: "Active Creators", value: "10K+" },
  { label: "Brand Partners", value: "2.5K+" },
  { label: "Campaigns Completed", value: "50K+" },
  { label: "Total Paid Out", value: "\u20B925Cr+" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Fashion Creator",
    text: "Collabo matched me with brands I actually love. My earnings tripled in 3 months!",
    rating: 5,
  },
  {
    name: "Rohit Verma",
    role: "Marketing Head, D2C Brand",
    text: "Finding the right creators used to take weeks. Now it takes minutes with AI matching.",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    role: "Lifestyle Influencer",
    text: "The instant payouts and transparent process make Collabo the best platform for creators.",
    rating: 5,
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, role, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && user && role) {
      if (role === "creator") router.push("/dashboard/creator");
      else if (role === "brand") router.push("/dashboard/brand");
    }
    if (!loading && user && !role) router.push("/role-select");
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Collabo
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-slate-700 hover:text-slate-900 font-medium"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0"
        />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <Sparkles className="w-4 h-4" />
              </motion.div>
              India&apos;s #1 Creator-Brand Matching Platform
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight"
            >
              Where Brands Meet{" "}
              <motion.span
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: "100% 50%" }}
                transition={{ duration: 3, repeat: Infinity }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                Creators
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Connect with the perfect partners using AI-powered matching.
              Launch campaigns, collaborate authentically, and grow &mdash; all
              in one platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all duration-300"
                  >
                    Start Free Today
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-slate-300 text-slate-700 px-8 py-3 text-base font-semibold hover:bg-slate-50"
                  >
                    I Already Have an Account
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="text-3xl font-extrabold text-slate-900"
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              How Collabo Works
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Three simple steps to start collaborating
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              <Card className="border border-slate-700 bg-slate-800/50 backdrop-blur h-full hover:border-blue-500/50 transition-all duration-300">
                <CardContent className="p-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30"
                  >
                    <Users className="w-7 h-7 text-blue-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    For Creators
                  </h3>
                  <div className="space-y-4">
                    {[
                      "Create your profile",
                      "Get AI-matched campaigns",
                      "Apply & earn",
                    ].map((step, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + j * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          className="w-7 h-7 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-400/50"
                        >
                          <span className="text-xs font-bold text-blue-300">
                            {j + 1}
                          </span>
                        </motion.div>
                        <p className="font-medium text-slate-200">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                  <Link href="/signup" className="block mt-6">
                    <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/50">
                      Join as Creator <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              <Card className="border border-slate-700 bg-slate-800/50 backdrop-blur h-full hover:border-purple-500/50 transition-all duration-300">
                <CardContent className="p-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30"
                  >
                    <Briefcase className="w-7 h-7 text-purple-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    For Brands
                  </h3>
                  <div className="space-y-4">
                    {[
                      "Post a campaign",
                      "Discover matched creators",
                      "Collaborate & grow",
                    ].map((step, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + j * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          className="w-7 h-7 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-400/50"
                        >
                          <span className="text-xs font-bold text-purple-300">
                            {j + 1}
                          </span>
                        </motion.div>
                        <p className="font-medium text-slate-200">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                  <Link href="/signup" className="block mt-6">
                    <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/50">
                      Join as Brand <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose Collabo?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built for the modern creator economy
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full hover:border-slate-300 bg-white">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-4`}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {feat.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Loved by Creators & Brands
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="border border-slate-200 shadow-sm h-full hover:shadow-lg transition-all duration-300 hover:border-slate-300 bg-white">
                  <CardContent className="p-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                      className="flex gap-1 mb-4"
                    >
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          transition={{ delay: j * 0.05 + i * 0.1 }}
                        >
                          <Star
                            key={j}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                    <p className="text-slate-700 mb-6 leading-relaxed">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div>
                      <p className="font-semibold text-slate-900">{t.name}</p>
                      <p className="text-sm text-slate-500">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.01 }}
            className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white p-12 md:p-16 text-center shadow-2xl shadow-blue-600/20 overflow-hidden relative"
          >
            <motion.div
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative z-10"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap className="w-12 h-12 mx-auto mb-6 opacity-80" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Collaborating?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of creators and brands building amazing
                partnerships.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-2 bg-white hover:bg-slate-100 text-blue-700 font-semibold px-8 shadow-lg transition-all duration-300"
                  >
                    Create Free Account <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">
                  Collabo
                </span>
              </div>
              <p className="text-sm text-slate-500">
                India&apos;s premium creator-brand matching platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Platform</h4>
              <div className="space-y-2">
                <Link
                  href="/campaigns"
                  className="block text-sm text-slate-500 hover:text-slate-700"
                >
                  Campaigns
                </Link>
                <Link
                  href="/creators"
                  className="block text-sm text-slate-500 hover:text-slate-700"
                >
                  Find Creators
                </Link>
                <Link
                  href="/signup"
                  className="block text-sm text-slate-500 hover:text-slate-700"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Company</h4>
              <div className="space-y-2">
                <span className="block text-sm text-slate-500">About Us</span>
                <span className="block text-sm text-slate-500">Contact</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Legal</h4>
              <div className="space-y-2">
                <span className="block text-sm text-slate-500">
                  Privacy Policy
                </span>
                <span className="block text-sm text-slate-500">
                  Terms of Service
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center">
            <p className="text-sm text-slate-500">
              &copy; 2026 Collabo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
