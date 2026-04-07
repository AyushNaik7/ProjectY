"use client";

/* eslint-disable react/no-unescaped-entities */

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
            <Image src="/logo.png" alt="InstaCollab" width={144} height={48} className="h-12 w-auto rounded-lg hover:opacity-80 transition-opacity" priority />
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
              <p className="text-muted-foreground">Last updated: April 7, 2026</p>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Welcome to InstaCollab. By accessing or using our platform at instacollab.com (the "Platform"), 
                  you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations 
                  of India. If you do not agree with any of these terms, you are prohibited from using or accessing 
                  this Platform.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms constitute a legally binding agreement between you and InstaCollab ("we", "us", or "our"). 
                  By using the Platform, you represent that you are at least 18 years of age and have the legal capacity 
                  to enter into this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Platform Description</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  InstaCollab is an Instagram influencer-brand collaboration platform that connects Instagram creators 
                  with brands for marketing campaigns. The Platform provides:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>AI-powered matching between creators and brand campaigns</li>
                  <li>Campaign discovery and management tools</li>
                  <li>Collaboration request and communication features</li>
                  <li>Profile management for creators and brands</li>
                  <li>Analytics and performance tracking</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  InstaCollab acts as a facilitator and is not a party to any agreements between creators and brands. 
                  We do not guarantee the quality, safety, or legality of campaigns or creator content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. User Accounts and Registration</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>3.1 Account Creation:</strong> To use certain features of the Platform, you must register 
                    for an account and select a role (Creator or Brand). You must provide accurate, complete, and current 
                    information during registration. Failure to do so constitutes a breach of these Terms.
                  </p>
                  <p className="leading-relaxed">
                    <strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of 
                    your account credentials and for all activities that occur under your account. You must immediately 
                    notify us of any unauthorized access or security breach.
                  </p>
                  <p className="leading-relaxed">
                    <strong>3.3 Account Types:</strong> Creator accounts are for individual Instagram influencers or 
                    content creators. Brand accounts are for businesses, agencies, or organizations seeking creator 
                    partnerships. Misrepresenting your account type is prohibited.
                  </p>
                  <p className="leading-relaxed">
                    <strong>3.4 Verification:</strong> We may verify your identity, Instagram account, or business 
                    credentials. Providing false information may result in account suspension or termination.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. User Responsibilities and Conduct</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>4.1 General Obligations:</strong> As a user of InstaCollab, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide accurate and truthful information in your profile and campaigns</li>
                  <li>Maintain professional and respectful conduct in all interactions</li>
                  <li>Honor all collaboration agreements made through the Platform</li>
                  <li>Comply with all applicable Indian laws, including IT Act 2000, Consumer Protection Act 2019</li>
                  <li>Respect intellectual property rights of others</li>
                  <li>Not engage in fraudulent, deceptive, or misleading practices</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4 mb-4">
                  <strong>4.2 Creator-Specific Obligations:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Accurately represent your follower count, engagement rates, and audience demographics</li>
                  <li>Disclose sponsored content as per ASCI (Advertising Standards Council of India) guidelines</li>
                  <li>Deliver content as agreed in collaboration terms</li>
                  <li>Not purchase fake followers, engagement, or use bots</li>
                  <li>Maintain ownership or proper rights to content you create</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4 mb-4">
                  <strong>4.3 Brand-Specific Obligations:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide accurate campaign details, budgets, and requirements</li>
                  <li>Make timely payments as agreed with creators</li>
                  <li>Respect creator intellectual property and usage rights</li>
                  <li>Not request content that violates laws or platform policies</li>
                  <li>Provide clear campaign briefs and feedback</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Prohibited Activities</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Violating any applicable laws or regulations</li>
                  <li>Infringing on intellectual property rights of others</li>
                  <li>Posting illegal, harmful, threatening, abusive, or offensive content</li>
                  <li>Harassing, stalking, or threatening other users</li>
                  <li>Impersonating any person or entity</li>
                  <li>Collecting or storing personal data of other users without consent</li>
                  <li>Transmitting viruses, malware, or malicious code</li>
                  <li>Attempting to gain unauthorized access to the Platform</li>
                  <li>Interfering with or disrupting the Platform's operation</li>
                  <li>Using automated systems (bots, scrapers) without permission</li>
                  <li>Manipulating metrics, reviews, or ratings</li>
                  <li>Engaging in money laundering or fraudulent financial activities</li>
                  <li>Promoting illegal products, services, or activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Collaboration Agreements and Payments</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>6.1 Direct Agreements:</strong> All collaboration agreements, including scope of work, 
                    deliverables, timelines, and payment terms, are made directly between creators and brands. 
                    InstaCollab is not a party to these agreements and bears no responsibility for their fulfillment.
                  </p>
                  <p className="leading-relaxed">
                    <strong>6.2 Payment Processing:</strong> Currently, all payments are processed directly between 
                    creators and brands outside the Platform. Both parties are responsible for complying with applicable 
                    tax laws, including GST registration and TDS deductions as per Indian Income Tax Act.
                  </p>
                  <p className="leading-relaxed">
                    <strong>6.3 Platform Fees:</strong> InstaCollab may introduce platform fees or subscription charges 
                    in the future. Any such fees will be clearly communicated with at least 30 days notice. Current 
                    access to the Platform is free during the beta period.
                  </p>
                  <p className="leading-relaxed">
                    <strong>6.4 Disputes:</strong> InstaCollab is not responsible for resolving payment disputes between 
                    creators and brands. Users are encouraged to resolve disputes amicably or through appropriate legal 
                    channels.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Intellectual Property Rights</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>7.1 Platform Ownership:</strong> The Platform and its original content, features, design, 
                    functionality, and source code are owned by InstaCollab and are protected by Indian and international 
                    copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  <p className="leading-relaxed">
                    <strong>7.2 User Content:</strong> You retain all rights to content you create and post on the Platform. 
                    By posting content, you grant InstaCollab a non-exclusive, worldwide, royalty-free license to use, 
                    display, reproduce, and distribute your content solely for operating and promoting the Platform.
                  </p>
                  <p className="leading-relaxed">
                    <strong>7.3 Creator-Brand Content Rights:</strong> Rights to content created as part of brand 
                    collaborations are governed by the agreement between the creator and brand. InstaCollab claims no 
                    ownership of such content.
                  </p>
                  <p className="leading-relaxed">
                    <strong>7.4 Trademarks:</strong> "InstaCollab" and associated logos are trademarks of InstaCollab. 
                    You may not use these marks without prior written permission.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Privacy and Data Protection</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>8.1 Privacy Policy:</strong> Your use of the Platform is also governed by our Privacy Policy, 
                    which is incorporated into these Terms by reference. Please review our Privacy Policy to understand 
                    our data collection and usage practices.
                  </p>
                  <p className="leading-relaxed">
                    <strong>8.2 Data Protection:</strong> We comply with applicable Indian data protection laws, including 
                    the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and 
                    Procedures and Sensitive Personal Data or Information) Rules, 2011.
                  </p>
                  <p className="leading-relaxed">
                    <strong>8.3 AI and Analytics:</strong> We use AI-powered matching algorithms that analyze your profile 
                    data to provide relevant recommendations. By using the Platform, you consent to this processing.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Account Termination and Suspension</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>9.1 Termination by User:</strong> You may terminate your account at any time by contacting 
                    us or using account deletion features. Upon termination, you remain responsible for any outstanding 
                    obligations.
                  </p>
                  <p className="leading-relaxed">
                    <strong>9.2 Termination by InstaCollab:</strong> We may suspend or terminate your account immediately, 
                    without prior notice, for violations of these Terms, fraudulent activity, or any reason we deem 
                    necessary to protect the Platform or other users.
                  </p>
                  <p className="leading-relaxed">
                    <strong>9.3 Effect of Termination:</strong> Upon termination, your right to use the Platform ceases 
                    immediately. We may delete your account data, though some information may be retained as required by 
                    law or for legitimate business purposes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Disclaimers and Warranties</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>10.1 "As Is" Basis:</strong> The Platform is provided on an "AS IS" and "AS AVAILABLE" basis 
                    without warranties of any kind, either express or implied, including but not limited to warranties of 
                    merchantability, fitness for a particular purpose, or non-infringement.
                  </p>
                  <p className="leading-relaxed">
                    <strong>10.2 No Guarantee:</strong> We do not guarantee that the Platform will be uninterrupted, 
                    error-free, or secure. We do not warrant the accuracy, completeness, or reliability of any content, 
                    user profiles, or AI-generated matches.
                  </p>
                  <p className="leading-relaxed">
                    <strong>10.3 Third-Party Content:</strong> We are not responsible for the accuracy, legality, or 
                    quality of user-generated content, campaigns, or creator profiles. Users interact with each other 
                    at their own risk.
                  </p>
                  <p className="leading-relaxed">
                    <strong>10.4 No Employment Relationship:</strong> InstaCollab does not create an employment or agency 
                    relationship between creators and brands. All collaborations are independent contractor relationships.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">11. Limitation of Liability</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>11.1 Maximum Liability:</strong> To the fullest extent permitted by Indian law, InstaCollab, 
                    its directors, employees, partners, agents, suppliers, and affiliates shall not be liable for any 
                    indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Loss of profits, revenue, or business opportunities</li>
                    <li>Loss of data or content</li>
                    <li>Loss of goodwill or reputation</li>
                    <li>Costs of procurement of substitute services</li>
                    <li>Damages arising from collaborations between users</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    <strong>11.2 Cap on Liability:</strong> Our total liability for any claims arising from your use of 
                    the Platform shall not exceed ₹10,000 (Ten Thousand Indian Rupees) or the amount you paid to us in 
                    the past 12 months, whichever is greater.
                  </p>
                  <p className="leading-relaxed">
                    <strong>11.3 User Disputes:</strong> We are not liable for disputes, damages, or losses arising from 
                    interactions between creators and brands, including payment disputes, content quality issues, or 
                    breach of collaboration agreements.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">12. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless InstaCollab, its affiliates, officers, directors, 
                  employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including 
                  reasonable attorneys' fees) arising from: (a) your use of the Platform; (b) your violation of these 
                  Terms; (c) your violation of any rights of another party; (d) content you post on the Platform; or 
                  (e) your collaborations with other users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">13. Dispute Resolution and Governing Law</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>13.1 Governing Law:</strong> These Terms shall be governed by and construed in accordance 
                    with the laws of India, without regard to conflict of law provisions. The courts of Mumbai, 
                    Maharashtra shall have exclusive jurisdiction over any disputes arising from these Terms.
                  </p>
                  <p className="leading-relaxed">
                    <strong>13.2 Dispute Resolution:</strong> In the event of any dispute, controversy, or claim arising 
                    out of or relating to these Terms, the parties agree to first attempt to resolve the dispute through 
                    good faith negotiations for a period of 30 days.
                  </p>
                  <p className="leading-relaxed">
                    <strong>13.3 Arbitration:</strong> If the dispute cannot be resolved through negotiation, it shall be 
                    referred to and finally resolved by arbitration under the Arbitration and Conciliation Act, 1996. The 
                    arbitration shall be conducted in English in Mumbai, Maharashtra by a sole arbitrator mutually agreed 
                    upon by the parties.
                  </p>
                  <p className="leading-relaxed">
                    <strong>13.4 User Disputes:</strong> Disputes between creators and brands must be resolved directly 
                    between the parties. InstaCollab may provide information to assist in resolution but is not obligated 
                    to mediate or resolve such disputes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">14. Changes to Terms</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>14.1 Modifications:</strong> We reserve the right to modify, update, or replace these Terms 
                    at any time at our sole discretion. Material changes will be notified through email, Platform 
                    notifications, or by posting a notice on the Platform.
                  </p>
                  <p className="leading-relaxed">
                    <strong>14.2 Effective Date:</strong> Changes become effective immediately upon posting unless 
                    otherwise specified. The "Last updated" date at the top of this page indicates when the Terms were 
                    last modified.
                  </p>
                  <p className="leading-relaxed">
                    <strong>14.3 Continued Use:</strong> Your continued use of the Platform after changes are posted 
                    constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop 
                    using the Platform and may terminate your account.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">15. Miscellaneous</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    <strong>15.1 Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute 
                    the entire agreement between you and InstaCollab regarding the Platform and supersede all prior 
                    agreements.
                  </p>
                  <p className="leading-relaxed">
                    <strong>15.2 Severability:</strong> If any provision of these Terms is found to be invalid or 
                    unenforceable, the remaining provisions shall remain in full force and effect.
                  </p>
                  <p className="leading-relaxed">
                    <strong>15.3 Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not 
                    constitute a waiver of such right or provision.
                  </p>
                  <p className="leading-relaxed">
                    <strong>15.4 Assignment:</strong> You may not assign or transfer these Terms or your account without 
                    our prior written consent. We may assign these Terms without restriction.
                  </p>
                  <p className="leading-relaxed">
                    <strong>15.5 Force Majeure:</strong> We shall not be liable for any failure or delay in performance 
                    due to circumstances beyond our reasonable control, including acts of God, war, terrorism, riots, 
                    embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or 
                    shortages of transportation, facilities, fuel, energy, labor, or materials.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">16. Contact Information</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    If you have any questions, concerns, or complaints about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p><strong>Email:</strong>{" "}
                      <a href="mailto:legal@instacollab.com" className="text-primary hover:underline">
                        legal@instacollab.com
                      </a>
                    </p>
                    <p><strong>Support:</strong>{" "}
                      <a href="mailto:support@instacollab.com" className="text-primary hover:underline">
                        support@instacollab.com
                      </a>
                    </p>
                    <p><strong>Business Inquiries:</strong>{" "}
                      <a href="mailto:hello@instacollab.com" className="text-primary hover:underline">
                        hello@instacollab.com
                      </a>
                    </p>
                  </div>
                  <p className="leading-relaxed mt-4">
                    We aim to respond to all inquiries within 2-3 business days. For urgent matters, please mark your 
                    email as "Urgent" in the subject line.
                  </p>
                </div>
              </section>

              <section className="border-t pt-6">
                <p className="text-sm text-muted-foreground italic">
                  By using InstaCollab, you acknowledge that you have read, understood, and agree to be bound by these 
                  Terms of Service. These Terms are effective as of the date you first access or use the Platform.
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
              © 2026 InstaCollab. All rights reserved.
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
