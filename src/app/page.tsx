"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/ClerkAuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    title: "Smart Matching",
    description:
      "AI analyzes audience fit, engagement patterns, and content style to connect you with the right partners.",
    icon: Sparkles,
  },
  {
    title: "Verified Partners",
    description:
      "Every profile is verified. Work with authentic creators and established brands you can trust.",
    icon: Shield,
  },
  {
    title: "Clear Analytics",
    description:
      "Track what matters—reach, engagement, and ROI—with dashboards built for decision-making.",
    icon: TrendingUp,
  },
  {
    title: "Fast Payments",
    description:
      "Creators receive payment within 48 hours of delivery. Simple, reliable, and transparent.",
    icon: Zap,
  },
];

const stats = [
  { label: "Active Creators", value: "10,000+" },
  { label: "Brand Partners", value: "2,500+" },
  { label: "Successful Campaigns", value: "50,000+" },
  { label: "Total Payouts", value: "₹25Cr+" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Fashion Creator",
    text: "I've tripled my brand partnerships in three months. The matches actually make sense for my audience.",
  },
  {
    name: "Rohit Verma",
    role: "Marketing Lead, D2C Brand",
    text: "Finding creators used to take weeks. Now we launch campaigns in days with better results.",
  },
  {
    name: "Ananya Patel",
    role: "Lifestyle Creator",
    text: "Fast payments and clear communication. Finally, a platform that respects creators.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role) {
      if (role === "creator") router.push("/dashboard/creator");
      else if (role === "brand") router.push("/dashboard/brand");
    }
    if (!loading && user && !role) router.push("/role-select");
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">InstaCollab</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">India's Instagram Creator Platform</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Where Brands Meet Instagram Creators
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              AI-powered matching connects you with the right Instagram influencers. Launch campaigns, collaborate authentically, and grow together.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Free Today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/50">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-4 text-xl font-semibold">For Creators</h3>
              <div className="space-y-3">
                {[
                  "Create your profile with portfolio",
                  "Get matched with relevant campaigns",
                  "Apply and start earning",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full">Join as Creator</Button>
              </Link>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-4 text-xl font-semibold">For Brands</h3>
              <div className="space-y-3">
                {[
                  "Post your campaign requirements",
                  "Review AI-matched creators",
                  "Launch and track performance",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full">Join as Brand</Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Choose Collabo</h2>
            <p className="text-lg text-muted-foreground">
              Built for the modern creator economy
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">Trusted by Creators & Brands</h2>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full p-6">
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
            <div className="p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
              <p className="mb-8 text-lg opacity-90">
                Join thousands of creators and brands building successful partnerships
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">InstaCollab</span>
              </div>
              <p className="text-sm text-muted-foreground">
                India's Instagram creator-brand platform
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link href="/campaigns" className="block text-muted-foreground hover:text-foreground">
                  Campaigns
                </Link>
                <Link href="/creators" className="block text-muted-foreground hover:text-foreground">
                  Find Creators
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground">
                  About
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="/privacy" className="block text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/terms" className="block text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2026 InstaCollab. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
