"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Mail,
  ArrowRight,
} from "lucide-react";

export function Footer() {
  const links = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Security", href: "/security" },
      { label: "Roadmap", href: "#roadmap" },
    ],
    Company: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
    Legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
      { label: "License", href: "/license" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
    { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
    { icon: Github, label: "GitHub", href: "https://github.com" },
  ];

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
      transition: { duration: 0.4 },
    },
  };

  return (
    <footer className="relative border-t border-white/5 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-md"
                style={{
                  background: "linear-gradient(135deg, #9333ea, #3b82f6)",
                }}
              >
                <span className="h-4 w-4 rounded-sm bg-white" />
              </span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                InstaCollab
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered creator collaboration platform transforming how influencers and brands work together.
            </p>
          </motion.div>

          {/* Links sections */}
          <motion.div
            className="lg:col-span-3 grid grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {Object.entries(links).map(([category, items]) => (
              <motion.div key={category} variants={itemVariants}>
                <h3 className="text-sm font-semibold text-white mb-4">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-400 hover:text-purple-400 transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Newsletter section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">
              Stay Updated
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <div className="py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-sm text-slate-400"
          >
            © 2024 InstaCollab. All rights reserved.
          </motion.p>

          {/* Social links */}
          <motion.div
            className="flex items-center gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:border-purple-500/30 transition-all duration-200"
                  aria-label={social.label}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              );
            })}
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-2 text-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-slate-400">All systems operational</span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
