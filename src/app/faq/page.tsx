"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  ArrowLeft, 
  ChevronDown, 
  Search,
  Users,
  Briefcase,
  DollarSign,
  Shield,
  Zap,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  // General
  {
    id: 1,
    question: "What is Collabo?",
    answer: "Collabo is a platform that connects content creators with brands for authentic collaborations. We use AI-powered matching to help creators find brand deals and brands discover the perfect creators for their campaigns.",
    category: "General"
  },
  {
    id: 2,
    question: "Is Collabo free to use?",
    answer: "Yes! Creating an account and browsing is completely free for both creators and brands. We may charge a small platform fee only when a collaboration is successfully completed.",
    category: "General"
  },
  {
    id: 3,
    question: "How does the matching system work?",
    answer: "Our AI-powered algorithm analyzes multiple factors including niche compatibility, audience demographics, engagement rates, budget alignment, and campaign requirements to suggest the best matches for both creators and brands.",
    category: "General"
  },
  
  // For Creators
  {
    id: 4,
    question: "How do I get started as a creator?",
    answer: "Simply sign up, select 'Creator' as your role, complete your profile with your social media stats, niche, and bio. Once your profile is complete, you can start browsing campaigns and applying to brand deals that match your audience.",
    category: "For Creators"
  },
  {
    id: 5,
    question: "What information do I need to provide?",
    answer: "You'll need to provide your name, niche, social media handles (Instagram, YouTube, etc.), follower count, average views, and engagement rate. The more complete your profile, the better matches you'll receive.",
    category: "For Creators"
  },
  {
    id: 6,
    question: "How do I apply to campaigns?",
    answer: "Browse available campaigns on your dashboard, review the requirements and budget, and click 'Apply Now' on campaigns that interest you. Brands will review your application and reach out if you're a good fit.",
    category: "For Creators"
  },
  {
    id: 7,
    question: "Can I negotiate the collaboration terms?",
    answer: "Yes! Once a brand accepts your application, you can discuss and negotiate terms including deliverables, timeline, and compensation before finalizing the agreement.",
    category: "For Creators"
  },
  {
    id: 8,
    question: "How do I get paid?",
    answer: "Payment terms are agreed upon between you and the brand. Typically, payments are made after content delivery and approval. We recommend discussing payment milestones upfront.",
    category: "For Creators"
  },
  {
    id: 9,
    question: "What is a verified badge and how do I get one?",
    answer: "A verified badge indicates that your account has been verified by our team. It helps build trust with brands. Verification is currently done manually - maintain a complete profile and successful collaborations to be considered.",
    category: "For Creators"
  },
  
  // For Brands
  {
    id: 10,
    question: "How do I create a campaign?",
    answer: "After signing up as a brand, go to your dashboard and click 'New Campaign'. Fill in the campaign details including niche, budget, deliverables, and timeline. Once published, creators can start applying.",
    category: "For Brands"
  },
  {
    id: 11,
    question: "How do I find the right creators?",
    answer: "Use our 'Find Creators' feature to browse creator profiles. You can filter by niche, follower count, engagement rate, and more. Our match score helps you identify creators who align best with your brand.",
    category: "For Brands"
  },
  {
    id: 12,
    question: "Can I contact creators directly?",
    answer: "Yes! You can send collaboration requests to creators whose profiles interest you. You can also review applications from creators who applied to your campaigns.",
    category: "For Brands"
  },
  {
    id: 13,
    question: "What is the match score?",
    answer: "The match score (0-100%) indicates how well a creator aligns with your campaign based on niche similarity, audience size, engagement rate, and other factors. Higher scores mean better alignment.",
    category: "For Brands"
  },
  {
    id: 14,
    question: "How many campaigns can I create?",
    answer: "You can create unlimited campaigns. Each campaign can target different niches, budgets, and objectives to help you find the perfect creators for various marketing goals.",
    category: "For Brands"
  },
  
  // Collaboration Process
  {
    id: 15,
    question: "What happens after I apply to a campaign?",
    answer: "The brand will review your application along with your profile and stats. If they're interested, they'll accept your request and you can begin discussing the collaboration details.",
    category: "Collaboration"
  },
  {
    id: 16,
    question: "What are the collaboration statuses?",
    answer: "Collaborations go through four stages: Requested (initial application), Accepted (brand approved), In Progress (work ongoing), and Completed (deliverables submitted and approved).",
    category: "Collaboration"
  },
  {
    id: 17,
    question: "Can I work on multiple campaigns at once?",
    answer: "Yes! You can apply to and work on multiple campaigns simultaneously, as long as you can meet all the deadlines and deliverables for each collaboration.",
    category: "Collaboration"
  },
  {
    id: 18,
    question: "What if I need to cancel a collaboration?",
    answer: "If you need to cancel, communicate with the other party as soon as possible. Frequent cancellations may affect your profile rating and future opportunities.",
    category: "Collaboration"
  },
  
  // Payment & Pricing
  {
    id: 19,
    question: "How much does Collabo charge?",
    answer: "Collabo may charge a small platform fee (typically 5-10%) on completed transactions. This fee helps us maintain and improve the platform. The exact fee structure will be clearly communicated before any transaction.",
    category: "Payment"
  },
  {
    id: 20,
    question: "When do I get paid?",
    answer: "Payment timing is agreed upon between creators and brands. Common arrangements include upfront payment, payment upon content delivery, or milestone-based payments.",
    category: "Payment"
  },
  {
    id: 21,
    question: "What payment methods are supported?",
    answer: "Payment arrangements are currently made directly between creators and brands. We recommend using secure payment methods and documenting all agreements.",
    category: "Payment"
  },
  
  // Safety & Security
  {
    id: 22,
    question: "Is my data safe on Collabo?",
    answer: "Yes! We take security seriously. All data is encrypted, we use secure authentication, and we never share your personal information without your consent. Read our Privacy Policy for details.",
    category: "Safety"
  },
  {
    id: 23,
    question: "How do I report suspicious activity?",
    answer: "If you encounter any suspicious behavior, scams, or inappropriate content, please contact us immediately at security@collabo.com. We investigate all reports promptly.",
    category: "Safety"
  },
  {
    id: 24,
    question: "What if there's a dispute?",
    answer: "We encourage open communication between parties. If you can't resolve an issue directly, contact our support team at support@collabo.com and we'll help mediate.",
    category: "Safety"
  },
  
  // Account Management
  {
    id: 25,
    question: "Can I change my account type?",
    answer: "Currently, you need to create separate accounts for creator and brand roles. This helps maintain clear profiles and prevents confusion.",
    category: "Account"
  },
  {
    id: 26,
    question: "How do I update my profile?",
    answer: "Go to Settings from your dashboard to update your profile information, stats, bio, and preferences. Keep your information current for better matches.",
    category: "Account"
  },
  {
    id: 27,
    question: "Can I delete my account?",
    answer: "Yes, you can delete your account from the Settings page. Note that this action is permanent and will remove all your data from our platform.",
    category: "Account"
  },
  {
    id: 28,
    question: "I forgot my password. What should I do?",
    answer: "Click 'Forgot Password' on the login page. We'll send you a password reset link to your registered email address.",
    category: "Account"
  },
  
  // Technical
  {
    id: 29,
    question: "Which browsers are supported?",
    answer: "Collabo works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.",
    category: "Technical"
  },
  {
    id: 30,
    question: "Is there a mobile app?",
    answer: "Currently, Collabo is a web-based platform optimized for both desktop and mobile browsers. A dedicated mobile app is in our roadmap for future development.",
    category: "Technical"
  },
];

const categories = [
  { name: "All", icon: HelpCircle },
  { name: "General", icon: Zap },
  { name: "For Creators", icon: Users },
  { name: "For Brands", icon: Briefcase },
  { name: "Collaboration", icon: MessageCircle },
  { name: "Payment", icon: DollarSign },
  { name: "Safety", icon: Shield },
  { name: "Account", icon: Users },
  { name: "Technical", icon: Zap },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Collabo" width={144} height={48} className="h-12 w-auto rounded-lg hover:opacity-80 transition-opacity" priority />
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
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about Collabo
            </p>
          </div>

          {/* Search Bar */}
          <Card className="border-0 shadow-sm mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category.name
                      ? "bg-primary text-white shadow-md"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </motion.button>
              );
            })}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or browse different categories
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {faq.question}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {openFAQ === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-2">
                              <p className="text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Still Have Questions */}
          <Card className="border-0 shadow-sm mt-12 bg-slate-50">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/contact">
                  <Button size="lg" className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Support
                  </Button>
                </Link>
                <a href="mailto:support@collabo.com">
                  <Button size="lg" variant="outline" className="gap-2">
                    Email Us
                  </Button>
                </a>
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

