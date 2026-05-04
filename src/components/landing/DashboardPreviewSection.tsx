"use client";

import { motion } from "framer-motion";
import { BarChart3, LineChart, Users, Zap } from "lucide-react";

export function DashboardPreviewSection() {
  return (
    <div className="relative py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-600/10 to-transparent blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful Dashboard
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Visualize all your campaigns and collaborations in one unified dashboard
          </p>
        </motion.div>

        {/* Dashboard mockup container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Glow effect background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-40" />

          {/* Main dashboard card */}
          <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Gradient overlay top */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-purple-600/10 to-transparent" />

            {/* Content */}
            <div className="relative space-y-8">
              {/* Header bar */}
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <p className="text-xs text-slate-400">InstaCollab Dashboard</p>
                <div className="w-20 h-6 rounded bg-white/5" />
              </div>

              {/* Dashboard grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left - Charts section */}
                <div className="md:col-span-2 space-y-6">
                  {/* Chart 1 - Line chart */}
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                    className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl p-6 border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-white">
                          Campaign Performance
                        </span>
                      </div>
                      <span className="text-xs text-green-400">↑ 12.5%</span>
                    </div>

                    {/* Mock line chart */}
                    <div className="h-32 flex items-end gap-1">
                      {[40, 50, 45, 70, 65, 80, 75, 85, 90].map((height, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-blue-500/50 to-blue-400/20 rounded-t-sm"
                          style={{ height: `${height}%` }}
                          animate={{
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2 + i * 0.1,
                            repeat: Infinity,
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* Chart 2 - Engagement metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: Users, label: "Active Campaigns", value: "24" },
                      { icon: BarChart3, label: "Total Reach", value: "2.4M" },
                      { icon: Zap, label: "Engagement", value: "8.2%" },
                    ].map((metric, i) => {
                      const Icon = metric.icon;
                      return (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-lg p-4 border border-white/5 hover:border-blue-500/20 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-4 h-4 text-blue-400" />
                            <p className="text-xs text-slate-400">
                              {metric.label}
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {metric.value}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Right - Activity feed */}
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl p-6 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: "New collaboration approved",
                        time: "2 mins ago",
                      },
                      {
                        title: "Campaign contract signed",
                        time: "15 mins ago",
                      },
                      {
                        title: "AI match found - Fashion Brand",
                        time: "1 hour ago",
                      },
                      {
                        title: "Analytics report ready",
                        time: "3 hours ago",
                      },
                    ].map((activity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="pb-3 border-b border-white/5 last:border-0"
                      >
                        <p className="text-xs font-medium text-slate-200">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {activity.time}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom gradient bar */}
              <div className="h-1 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-full" />
            </div>
          </div>

          {/* Floating accent cards */}
          <motion.div
            className="absolute -left-8 -bottom-8 w-56 md:w-64"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-4 border border-purple-500/30 backdrop-blur-sm shadow-lg">
              <p className="text-xs font-semibold text-purple-300 mb-2">
                AI Insight
              </p>
              <p className="text-sm text-white font-medium mb-3">
                Recommended creator match
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-300">Sarah Martinez</p>
                  <p className="text-xs text-slate-400">Fashion & Lifestyle</p>
                </div>
                <p className="text-sm font-bold text-green-400">95%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-8 -top-8 w-48 md:w-56"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-blue-500/30 backdrop-blur-sm shadow-lg">
              <p className="text-xs font-semibold text-blue-300 mb-2">
                Campaign Alert
              </p>
              <p className="text-sm text-white font-medium">
                Summer Collection 2024
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border border-slate-900"
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-300">+2 more</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
