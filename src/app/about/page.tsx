"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Info, ArrowLeft, Target, Users, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To bridge the gap between talented creators and innovative brands, fostering meaningful collaborations that drive real results.",
    },
    {
      icon: Users,
      title: "For Everyone",
      description:
        "Whether you're a creator looking for brand deals or a brand seeking authentic voices, Collabo is your platform.",
    },
    {
      icon: Zap,
      title: "Smart Matching",
      description:
        "Our AI-powered matching algorithm connects you with the perfect partners based on niche, engagement, and goals.",
    },
    {
      icon: Heart,
      title: "Built with Care",
      description:
        "We're committed to creating a safe, transparent, and efficient platform for all our users.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Collabo" className="h-12 w-auto rounded-lg hover:opacity-80 transition-opacity" />
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">About Collabo</h1>
              <p className="text-muted-foreground">Connecting creators with brands</p>
            </div>
          </div>

          {/* Hero Section */}
          <Card className="border-0 shadow-sm mb-12">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                Empowering Collaborations, One Match at a Time
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Collabo is a modern platform designed to simplify and enhance the collaboration 
                process between content creators and brands. We believe that authentic partnerships 
                drive the best results, and our mission is to make those connections effortless.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded in 2026, we&apos;ve built a platform that understands the unique needs of both 
                creators and brands, providing tools and features that make collaboration seamless, 
                transparent, and rewarding.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="border-0 shadow-sm h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* What We Offer */}
          <Card className="border-0 shadow-sm mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">What We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">For Creators</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Discover brand campaigns that match your niche and audience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Showcase your work with a professional media kit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Manage collaboration requests in one place</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Track your deals from start to completion</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-600">For Brands</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Find creators who align with your brand values</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Post campaigns and receive applications from interested creators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>View detailed analytics and engagement metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Streamline your influencer marketing workflow</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Values */}
          <Card className="border-0 shadow-sm mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Our Values</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Transparency</h3>
                  <p className="leading-relaxed">
                    We believe in clear communication and honest dealings. No hidden fees, no surprises.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Quality</h3>
                  <p className="leading-relaxed">
                    We prioritize quality over quantity, ensuring meaningful matches that benefit both parties.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Innovation</h3>
                  <p className="leading-relaxed">
                    We continuously improve our platform with cutting-edge technology and user feedback.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Community</h3>
                  <p className="leading-relaxed">
                    We foster a supportive community where creators and brands can thrive together.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/10 to-blue-500/10">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Collaborating?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of creators and brands who are already building successful partnerships on Collabo.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="gap-2">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Collabo. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
