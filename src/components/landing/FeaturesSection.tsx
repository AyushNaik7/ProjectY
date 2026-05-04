"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Users,
  LineChart,
  Shield,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI Campaign Management",
    description:
      "Smart campaign creation and management powered by machine learning. Automate workflows and scale effortlessly.",
  },
  {
    icon: Users,
    title: "AI Matching Algorithm",
    description:
      "Connect with perfect collaborators. Our AI analyzes audience, engagement, and brand alignment.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Collaboration",
    description:
      "Seamless messaging, file sharing, and collaboration tools built for modern creators and brands.",
  },
  {
    icon: LineChart,
    title: "Analytics Dashboard",
    description:
      "Comprehensive insights into campaign performance, reach, engagement, and ROI in one place.",
  },
  {
    icon: Shield,
    title: "Contract Review & Automation",
    description:
      "AI-powered contract generation and review. Protect both parties with intelligent legal workflows.",
  },
  {
    icon: Sparkles,
    title: "Content Calendar",
    description:
      "Unified content planning and scheduling. Coordinate across teams and creators with ease.",
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="relative py-24 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl opacity-20" />
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Built for modern creator collaboration. Manage campaigns, find perfect matches, and grow together.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                {/* Card background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 rounded-2xl transition-all duration-300" />

                {/* Main card */}
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-white/5 group-hover:border-purple-500/20 transition-all duration-300 backdrop-blur-sm h-full flex flex-col">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-7 h-7 text-purple-400 group-hover:text-blue-400 transition-colors" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed flex-grow">
                    {feature.description}
                  </p>

                  {/* Bottom accent */}
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center text-purple-400 text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                    Learn more →
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
