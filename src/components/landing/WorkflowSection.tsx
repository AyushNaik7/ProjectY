"use client";

import { motion, type Variants } from "framer-motion";
import {
  CheckCircle,
  Lightbulb,
  Handshake,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const workflowSteps = [
  {
    number: "01",
    title: "Plan",
    description: "Define your campaign goals, target audience, and budget",
    icon: Lightbulb,
  },
  {
    number: "02",
    title: "Collaborate",
    description: "AI matches you with perfect creators or brands",
    icon: Handshake,
  },
  {
    number: "03",
    title: "Review",
    description: "Review proposals, contracts, and collaborate in real-time",
    icon: CheckCircle,
  },
  {
    number: "04",
    title: "Analyze",
    description: "Track performance and optimize for maximum ROI",
    icon: BarChart3,
  },
];

export function WorkflowSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="relative py-24 bg-slate-950 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-6">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Powerful Workflow
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From planning to analysis, streamline your collaboration process
          </p>
        </motion.div>

        {/* Workflow steps - Desktop horizontal layout */}
        <div className="hidden lg:block">
          <motion.div
            className="relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Connection line */}
            <div className="absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20" />

            {/* Steps container */}
            <div className="grid grid-cols-4 gap-8 relative">
              {workflowSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="relative"
                  >
                    {/* Connection arrow (hidden on last item) */}
                    {index < workflowSteps.length - 1 && (
                      <div className="absolute -right-4 top-1/3 z-10">
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-blue-500/50"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </div>
                    )}

                    {/* Step card */}
                    <div className="relative flex flex-col items-center text-center">
                      {/* Icon circle */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative mb-6"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/30 flex items-center justify-center hover:border-blue-500/60 transition-colors">
                          <IconComponent className="w-10 h-10 text-blue-400" />
                        </div>
                      </motion.div>

                      {/* Step number and title */}
                      <div className="mb-3">
                        <p className="text-sm font-bold text-blue-400 mb-1">
                          {step.number}
                        </p>
                        <h3 className="text-xl font-bold text-white">
                          {step.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Mobile vertical layout */}
        <motion.div
          className="lg:hidden space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {workflowSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative"
              >
                <div className="flex gap-6">
                  {/* Left - Icon */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/30 flex items-center justify-center mb-4 flex-shrink-0">
                      <IconComponent className="w-8 h-8 text-blue-400" />
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div className="w-1 h-12 bg-gradient-to-b from-blue-600/50 to-transparent" />
                    )}
                  </div>

                  {/* Right - Content */}
                  <div className="pb-6">
                    <p className="text-sm font-bold text-blue-400 mb-2">
                      {step.number}
                    </p>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
