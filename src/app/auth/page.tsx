"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Users, Briefcase, ArrowRight } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Collabo" width={144} height={48} className="h-12 w-auto rounded-lg hover:opacity-80 transition-opacity" priority />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Welcome to Collabo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect creators with brands. Choose your role to get started.
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Creator Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -8 }}
          >
            <Link href="/">
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full bg-slate-50">
                <CardContent className="p-8 flex flex-col items-center text-center h-full justify-between">
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      I&apos;m a Creator
                    </h2>
                    <p className="text-muted-foreground">
                      Find brand deals, collaborate with premium brands, and
                      earn what you deserve.
                    </p>
                  </div>

                  <div className="w-full">
                    <Button
                      size="lg"
                      className="w-full gap-2 bg-primary hover:bg-primary/90"
                    >
                      Continue as Creator
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Brand Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8 }}
          >
            <Link href="/dashboard/brand">
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full bg-slate-50">
                <CardContent className="p-8 flex flex-col items-center text-center h-full justify-between">
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      I&apos;m a Brand
                    </h2>
                    <p className="text-muted-foreground">
                      Post campaigns, find creators, and manage collaborations
                      all in one place.
                    </p>
                  </div>

                  <div className="w-full">
                    <Button
                      size="lg"
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Continue as Brand
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 pt-20 border-t border-border/50"
        >
          <h3 className="text-2xl font-bold text-foreground text-center mb-12">
            Why Choose Collabo?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Matching",
                description:
                  "AI-powered algorithm matches creators with brands based on niche and audience",
              },
              {
                title: "Secure Payments",
                description:
                  "Safe and transparent payment system with instant payouts",
              },
              {
                title: "Easy Collaboration",
                description:
                  "Streamlined communication and deal management in one platform",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 rounded-full bg-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

