"use client";

import { motion, type Variants } from "framer-motion";
import { CheckCircle, Brain, FileText, Sparkles } from "lucide-react";

export function AIFeaturesSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  const features = [
    {
      icon: Brain,
      title: "Smart Matching",
      description:
        "AI analyzes audience demographics, engagement patterns, and brand alignment to find perfect matches.",
    },
    {
      icon: FileText,
      title: "Contract Intelligence",
      description:
        "Automated contract generation, review, and risk analysis using advanced NLP technology.",
    },
    {
      icon: Sparkles,
      title: "Content Insights",
      description:
        "Get AI-powered recommendations for optimal content types, posting times, and formats.",
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description:
        "Automatic verification and compliance checks to ensure brand safety and partnership success.",
    },
  ];

  return (
    <div className="relative py-24 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-6">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">AI Powered</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Meets</span> Collaboration
              </h2>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-lg text-slate-300 leading-relaxed"
            >
              Our advanced AI engine powers every aspect of the collaboration experience. From intelligent creator matching to automated contract review, we handle the heavy lifting so you can focus on what matters most.
            </motion.p>

            {/* Features list */}
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right - UI Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            {/* Glow background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-2xl opacity-40" />

            {/* Main preview card */}
            <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-8 border border-white/10 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-6">
                <Brain className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-white">
                  AI Contract Review
                </span>
              </div>

              {/* Contract preview */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Agreement Type
                    </p>
                    <p className="text-sm font-semibold text-white">
                      Campaign Collaboration
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      AI
                    </div>
                  </motion.div>
                </div>

                {/* AI Analysis */}
                <div className="bg-white/5 rounded-lg p-4 space-y-3 border border-white/5">
                  <h4 className="text-xs font-semibold text-blue-300 uppercase">
                    AI Analysis
                  </h4>

                  {[
                    {
                      label: "Payment Terms",
                      status: "✓ Verified",
                      color: "text-green-400",
                    },
                    {
                      label: "Usage Rights",
                      status: "⚠ Review",
                      color: "text-yellow-400",
                    },
                    {
                      label: "Deliverables",
                      status: "✓ Verified",
                      color: "text-green-400",
                    },
                    {
                      label: "Liability",
                      status: "✓ Verified",
                      color: "text-green-400",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300">{item.label}</span>
                      <span className={item.color}>{item.status}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Risk score */}
                <div className="flex items-center justify-between bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <span className="text-xs font-medium text-green-300">
                    Overall Risk Level
                  </span>
                  <span className="text-sm font-bold text-green-400">Low</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                  Approve
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                  Review
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
