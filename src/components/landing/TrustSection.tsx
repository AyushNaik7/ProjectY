"use client";

import { motion } from "framer-motion";

const brands = [
  { name: "TechFlow", id: 1 },
  { name: "Creative Hub", id: 2 },
  { name: "Digital First", id: 3 },
  { name: "Innovation Labs", id: 4 },
  { name: "Future Media", id: 5 },
  { name: "Brand Connect", id: 6 },
];

export function TrustSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="relative py-16 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-slate-400 text-sm font-medium mb-2">TRUSTED BY</p>
          <h2 className="text-2xl font-bold text-white">
            Thousands of Creators and Brands
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {brands.map((brand) => (
            <motion.div
              key={brand.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div className="flex items-center justify-center h-24 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 p-4 cursor-pointer overflow-hidden relative">
                {/* Hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/20 group-hover:to-blue-600/20 transition-all duration-300" />

                {/* Grayscale by default, color on hover */}
                <span className="relative text-center text-xs md:text-sm font-semibold text-slate-400 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                  {brand.name}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 md:gap-8 mt-16 pt-12 border-t border-white/5"
        >
          {[
            { number: "5K+", label: "Active Users" },
            { number: "2.4M", label: "Combined Reach" },
            { number: "98%", label: "Satisfaction Rate" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {stat.number}
              </p>
              <p className="text-slate-400 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
