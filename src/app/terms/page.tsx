"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: February 22, 2026</p>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Collabo, you agree to be bound by these Terms of Service and all 
                  applicable laws and regulations. If you do not agree with any of these terms, you are 
                  prohibited from using or accessing this platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Use License</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily access Collabo for personal, non-commercial use only. 
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or public display</li>
                  <li>Attempt to decompile or reverse engineer any software on the platform</li>
                  <li>Remove any copyright or proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or mirror the materials on any other server</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    When you create an account with us, you must provide accurate, complete, and current 
                    information. Failure to do so constitutes a breach of the Terms.
                  </p>
                  <p className="leading-relaxed">
                    You are responsible for safeguarding the password and for all activities that occur 
                    under your account. You must notify us immediately upon becoming aware of any breach 
                    of security or unauthorized use of your account.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">User Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  As a user of Collabo, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide accurate and truthful information in your profile</li>
                  <li>Maintain professional conduct in all interactions</li>
                  <li>Honor all collaboration agreements made through the platform</li>
                  <li>Not engage in fraudulent or deceptive practices</li>
                  <li>Not harass, abuse, or harm other users</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Content Guidelines</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Users are solely responsible for the content they post. You agree not to post content that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Is illegal, harmful, or offensive</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains viruses or malicious code</li>
                  <li>Violates privacy or publicity rights</li>
                  <li>Is spam or unsolicited advertising</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Payments and Fees</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All financial transactions between brands and creators are the responsibility of the 
                  parties involved. Collabo may charge platform fees for certain services, which will be 
                  clearly communicated before any transaction. All fees are non-refundable unless otherwise 
                  stated.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The platform and its original content, features, and functionality are owned by Collabo 
                  and are protected by international copyright, trademark, patent, trade secret, and other 
                  intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may terminate or suspend your account immediately, without prior notice or liability, 
                  for any reason, including breach of these Terms. Upon termination, your right to use the 
                  platform will immediately cease.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall Collabo, nor its directors, employees, partners, agents, suppliers, or 
                  affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
                  damages, including loss of profits, data, use, or goodwill.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your use of the platform is at your sole risk. The platform is provided on an &quot;AS IS&quot; 
                  and &quot;AS AVAILABLE&quot; basis. We make no warranties or representations about the accuracy 
                  or completeness of the platform&apos;s content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of India, 
                  without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. We will provide notice 
                  of any material changes by posting the new Terms on this page and updating the 
                  &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms, please contact us at:{" "}
                  <a href="mailto:legal@collabo.com" className="text-primary hover:underline">
                    legal@collabo.com
                  </a>
                </p>
              </section>
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
