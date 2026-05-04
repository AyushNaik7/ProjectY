"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const floatingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, delay: 0.3 },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-1/3 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl opacity-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-160px)]">
          {/* Left Content */}
          <motion.div
            className="flex flex-col justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm"
                variants={itemVariants}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="text-sm text-purple-300">AI-Powered Platform</span>
              </motion.div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="text-white">AI-Powered </span>
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Creator Collaboration
                  </span>
                  <span className="text-white"> Platform</span>
                </h1>
              </div>

              {/* Subtext */}
              <motion.p
                variants={itemVariants}
                className="text-lg text-slate-300 max-w-lg leading-relaxed"
              >
                Connect with perfect collaborators using advanced AI matching. Manage campaigns, collaborate in real-time, and scale your influence with our all-in-one platform.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group">
                  <Play className="w-4 h-4 fill-current" />
                  View Demo
                </button>
              </motion.div>

              {/* Trust Text */}
              <motion.p
                variants={itemVariants}
                className="text-sm text-slate-400 pt-4"
              >
                Join 5,000+ creators and brands already collaborating
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Right - Floating Dashboard Mockup */}
          <motion.div
            variants={floatingVariants}
            initial="hidden"
            animate="visible"
            className="relative h-full hidden lg:flex items-center justify-center"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full"
            >
              {/* Gradient glow background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-3xl blur-3xl opacity-40" />

              {/* Main card */}
              <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  </div>
                  <span className="text-xs text-slate-400">Dashboard</span>
                </div>

                {/* Content Grid */}
                <div className="space-y-4 pt-4">
                  {/* Chart mockup */}
                  <div className="space-y-2">
                    <div className="flex items-end gap-2 h-20">
                      {[60, 80, 45, 90, 70, 85, 55].map((height, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-500/50 to-blue-500/50 rounded-t"
                          style={{ height: `${height}%` }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.05, duration: 0.5 }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">Campaign Performance</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Active", value: "24" },
                      { label: "Reach", value: "2.4M" },
                      { label: "Engagement", value: "8.2%" },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-purple-500/30 transition-colors"
                      >
                        <p className="text-xs text-slate-400">{stat.label}</p>
                        <p className="text-sm font-semibold text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3 shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-purple-300">
                    AI
                  </div>
                </motion.div>
              </div>

              {/* Secondary card - positioned offset */}
              <motion.div
                className="absolute -left-12 -bottom-8 w-48 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl p-4 backdrop-blur-xl border border-white/5 shadow-xl"
                animate={{
                  y: [0, 15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div className="text-xs text-slate-400 mb-2">New Collaboration</div>
                <p className="text-sm font-semibold text-white">Fashion Brand × 12 Creators</p>
                <p className="text-xs text-purple-300 mt-2">✓ AI Matched</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
