"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Collabo"
              width={144}
              height={48}
              className="h-12 w-auto rounded-lg hover:opacity-80 transition-opacity"
              priority
            />
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
            <Shield className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground">
                Last updated: March 1, 2026
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 space-y-8">
              {/* 1. Introduction */}
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Welcome to{" "}
                    <strong className="text-foreground">Collabo</strong>, a
                    comprehensive influencer marketing platform that connects
                    content creators with brands for meaningful collaborations.
                    Collabo is designed to streamline the process of
                    discovering, analyzing, and managing influencer
                    partnerships.
                  </p>
                  <p>
                    At Collabo, we respect your privacy and are committed to
                    protecting your personal data. This privacy policy explains
                    how we collect, use, store, and protect your information
                    when you use our platform.
                  </p>
                  <p className="font-semibold text-foreground">
                    Important: Collabo integrates with Instagram through the
                    official Meta Platform API (formerly Facebook Platform).
                    When you connect your Instagram account, we access certain
                    data from your Instagram profile through this authorized API
                    integration to provide you with analytics, insights, and
                    campaign matching services.
                  </p>
                  <p>
                    By using Collabo, you agree to the collection and use of
                    information in accordance with this policy. If you do not
                    agree with our policies and practices, please do not use our
                    platform.
                  </p>
                </div>
              </section>

              {/* 2. Data We Collect */}
              <section>
                <h2 className="text-2xl font-bold mb-4">2. Data We Collect</h2>
                <div className="space-y-5 text-muted-foreground">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      2.1 Account Information
                    </h3>
                    <p className="mb-2">
                      When you create a Collabo account, we collect:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>Full name and username</li>
                      <li>Email address</li>
                      <li>Password (encrypted and securely stored)</li>
                      <li>Profile picture (optional)</li>
                      <li>Account type (Creator or Brand)</li>
                      <li>Biography and professional information</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      2.2 Instagram Data (via Meta Platform API)
                    </h3>
                    <p className="mb-2 font-medium text-foreground">
                      When you authorize Collabo to connect with your Instagram
                      account, we collect the following data through the Meta
                      Platform API:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>
                        <strong className="text-foreground">
                          Instagram Profile Information:
                        </strong>{" "}
                        Username, display name, profile picture, biography,
                        website link, and account type (Business, Creator, or
                        Personal)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Follower Metrics:
                        </strong>{" "}
                        Total follower count, following count, and audience
                        demographics (age ranges, gender distribution, top
                        locations, and active times)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Engagement Metrics:
                        </strong>{" "}
                        Likes, comments, shares, saves, reach, and impressions
                        on your posts, stories, and reels
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Media Content Insights:
                        </strong>{" "}
                        Post performance data including engagement rates, reach
                        statistics, impressions, and time-based performance
                        metrics for your published content
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Content Metadata:
                        </strong>{" "}
                        Media type (photo, video, carousel, reel, story),
                        captions, hashtags, mentions, timestamps, and location
                        tags
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Story Insights:
                        </strong>{" "}
                        Story views, exits, replies, and engagement metrics
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Audience Insights:
                        </strong>{" "}
                        Follower growth trends, reach and impression trends, and
                        audience engagement patterns
                      </li>
                      <li>
                        <strong className="text-foreground">
                          OAuth Access Tokens:
                        </strong>{" "}
                        Securely encrypted authentication tokens that enable
                        Collabo to access your Instagram data on your behalf
                        (these tokens are stored with AES-256 encryption and are
                        never shared with third parties)
                      </li>
                    </ul>
                    <p className="mt-3 text-sm bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <strong className="text-foreground">Note:</strong> We only
                      collect Instagram data that is necessary to provide our
                      analytics and campaign matching services. All data is
                      accessed with your explicit permission through
                      Instagram&apos;s OAuth authorization flow, and you can
                      revoke this access at any time through your Instagram
                      settings or Collabo dashboard.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      2.3 Campaign and Collaboration Data
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>Campaign preferences and interests</li>
                      <li>Saved campaigns and favorite brands</li>
                      <li>Collaboration requests and responses</li>
                      <li>Communication history within the platform</li>
                      <li>Campaign performance and deliverables</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      2.4 Technical and Usage Data
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>IP address and device identifiers</li>
                      <li>Browser type, version, and language settings</li>
                      <li>Operating system and device information</li>
                      <li>
                        Pages visited, features used, and time spent on the
                        platform
                      </li>
                      <li>Referral sources and navigation paths</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>Error logs and diagnostic data</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      2.5 Payment Information (For Brand Accounts)
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>Billing address and contact information</li>
                      <li>
                        Payment card details (processed securely through PCI-DSS
                        compliant third-party payment processors)
                      </li>
                      <li>Transaction history and invoices</li>
                    </ul>
                    <p className="mt-2 text-sm">
                      <strong className="text-foreground">Note:</strong> We do
                      not store complete payment card numbers on our servers.
                      Payment processing is handled by certified third-party
                      processors.
                    </p>
                  </div>
                </div>
              </section>

              {/* 3. How We Use Your Data */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  3. How We Use Your Data
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    We use the collected data exclusively to provide, improve,
                    and personalize our services. Specifically:
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      3.1 Service Delivery
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>To create and manage your Collabo account</li>
                      <li>
                        To authenticate your identity and maintain account
                        security
                      </li>
                      <li>
                        To provide access to platform features and
                        functionalities
                      </li>
                      <li>
                        To process and fulfill campaign collaboration requests
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      3.2 Analytics and Insights
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>
                        To display comprehensive Instagram analytics in your
                        creator dashboard
                      </li>
                      <li>
                        To generate performance metrics, growth trends, and
                        audience insights
                      </li>
                      <li>
                        To calculate engagement rates, reach statistics, and
                        content performance
                      </li>
                      <li>
                        To provide comparative analytics and industry benchmarks
                      </li>
                      <li>
                        To create visualizations and reports of your social
                        media performance
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      3.3 Campaign Matching
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>
                        To match creators with relevant brand campaigns based on
                        audience demographics, engagement metrics, and content
                        style
                      </li>
                      <li>
                        To recommend campaigns that align with creator interests
                        and performance
                      </li>
                      <li>
                        To help brands discover creators who fit their campaign
                        requirements
                      </li>
                      <li>
                        To facilitate meaningful collaborations between creators
                        and brands
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      3.4 Platform Improvement
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>
                        To analyze platform usage patterns and improve user
                        experience
                      </li>
                      <li>
                        To develop new features and enhance existing
                        functionality
                      </li>
                      <li>
                        To troubleshoot technical issues and optimize
                        performance
                      </li>
                      <li>
                        To conduct research and analysis for service improvement
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      3.5 Communication
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>
                        To send important service notifications and updates
                      </li>
                      <li>
                        To notify you about campaign opportunities and
                        collaboration requests
                      </li>
                      <li>
                        To provide customer support and respond to inquiries
                      </li>
                      <li>
                        To send promotional communications (with your consent)
                      </li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      3.6 What We DO NOT Do With Your Data
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>
                        <strong className="text-foreground">
                          We DO NOT sell your personal data or Instagram data to
                          third parties
                        </strong>
                      </li>
                      <li>
                        <strong className="text-foreground">
                          We DO NOT use your data for advertising outside the
                          Collabo platform
                        </strong>
                      </li>
                      <li>
                        <strong className="text-foreground">
                          We DO NOT share your Instagram metrics with
                          unauthorized parties
                        </strong>
                      </li>
                      <li>
                        <strong className="text-foreground">
                          We DO NOT use your data for purposes other than those
                          stated in this policy
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 4. Data Storage & Security */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  4. Data Storage & Security
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    The security and integrity of your data is of paramount
                    importance to us. We implement comprehensive security
                    measures to protect your personal information and Instagram
                    data from unauthorized access, disclosure, alteration, or
                    destruction.
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      4.1 Security Measures
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>
                        <strong className="text-foreground">
                          Encryption in Transit:
                        </strong>{" "}
                        All data transmitted between your browser and our
                        servers is encrypted using TLS 1.3 (Transport Layer
                        Security) with 256-bit encryption
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Encryption at Rest:
                        </strong>{" "}
                        Sensitive data, including OAuth tokens and
                        authentication credentials, is encrypted using AES-256
                        encryption when stored in our databases
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Password Protection:
                        </strong>{" "}
                        User passwords are hashed using industry-standard bcrypt
                        algorithms with salt, ensuring they cannot be reversed
                        or decrypted
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Access Control:
                        </strong>{" "}
                        Strict role-based access controls (RBAC) ensure that
                        only authorized personnel can access specific data, and
                        all access is logged and monitored
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Regular Security Audits:
                        </strong>{" "}
                        We conduct regular security assessments, penetration
                        testing, and vulnerability scans to identify and address
                        potential security risks
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Secure Infrastructure:
                        </strong>{" "}
                        Our servers are hosted on enterprise-grade cloud
                        infrastructure with built-in DDoS protection, firewalls,
                        and intrusion detection systems
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Data Backup:
                        </strong>{" "}
                        Regular automated backups ensure data integrity and
                        enable disaster recovery
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      4.2 Data Storage Location
                    </h3>
                    <p>
                      Your data is stored on secure servers located in data
                      centers that comply with international security standards
                      (SOC 2, ISO 27001). We use industry-leading cloud service
                      providers with redundancy and failover mechanisms to
                      ensure high availability and data durability.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      4.3 Access Restrictions
                    </h3>
                    <p>
                      Access to personal data and Instagram data is strictly
                      limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 ml-4 mt-2">
                      <li>
                        Authorized Collabo employees who require access to
                        perform their job functions (e.g., customer support,
                        technical maintenance)
                      </li>
                      <li>
                        Third-party service providers bound by strict
                        confidentiality agreements and data protection
                        requirements
                      </li>
                      <li>
                        All access is logged, monitored, and subject to audit
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      4.4 Third-Party Service Providers
                    </h3>
                    <p className="mb-2">
                      We work with trusted third-party service providers who
                      assist us in operating the platform. These providers have
                      access to certain data only to perform specific tasks on
                      our behalf and are obligated to protect your information:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>Cloud hosting and infrastructure providers</li>
                      <li>Payment processors (PCI-DSS compliant)</li>
                      <li>
                        Email service providers for transactional communications
                      </li>
                      <li>Analytics and monitoring services</li>
                      <li>Customer support tools</li>
                    </ul>
                    <p className="mt-2">
                      All third-party providers are contractually required to
                      maintain the confidentiality and security of your data and
                      are prohibited from using it for any purpose other than
                      providing services to Collabo.
                    </p>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      4.5 Important Security Disclaimer
                    </h3>
                    <p>
                      While we implement robust security measures, no method of
                      transmission over the Internet or electronic storage is
                      100% secure. We cannot guarantee absolute security of your
                      data. We continuously work to improve our security
                      practices and promptly address any identified
                      vulnerabilities.
                    </p>
                    <p className="mt-2">
                      If we become aware of a data breach that affects your
                      personal information, we will notify you promptly in
                      accordance with applicable data protection laws.
                    </p>
                  </div>
                </div>
              </section>

              {/* 5. Data Sharing and Disclosure */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  5. Data Sharing and Disclosure
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground text-lg">
                    We do NOT sell, rent, or trade your personal data or
                    Instagram data to third parties for marketing purposes.
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      5.1 When We Share Data
                    </h3>
                    <p className="mb-2">
                      We may share limited data in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>
                        <strong className="text-foreground">
                          With Other Users:
                        </strong>{" "}
                        When you apply to a campaign or accept a collaboration
                        request, certain profile information (name, username,
                        profile picture, and public Instagram metrics) may be
                        visible to brands. You control what information is
                        public in your profile settings.
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Service Providers:
                        </strong>{" "}
                        With trusted third-party vendors who perform services on
                        our behalf (hosting, analytics, payment processing,
                        customer support) under strict confidentiality
                        agreements.
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Legal Requirements:
                        </strong>{" "}
                        When required by law, regulation, legal process, or
                        governmental request, including to:
                        <ul className="list-circle list-inside ml-6 mt-1 space-y-1">
                          <li>
                            Comply with court orders, subpoenas, or legal
                            obligations
                          </li>
                          <li>
                            Enforce our Terms of Service and other agreements
                          </li>
                          <li>
                            Protect the rights, property, or safety of Collabo,
                            our users, or the public
                          </li>
                          <li>
                            Detect, prevent, or address fraud, security, or
                            technical issues
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Business Transfers:
                        </strong>{" "}
                        In the event of a merger, acquisition, reorganization,
                        or sale of assets, your data may be transferred as part
                        of that transaction. We will notify you before your data
                        is transferred and becomes subject to a different
                        privacy policy.
                      </li>
                      <li>
                        <strong className="text-foreground">
                          With Your Consent:
                        </strong>{" "}
                        We may share your data for purposes not described in
                        this policy when we have your explicit consent.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      5.2 Aggregated and Anonymized Data
                    </h3>
                    <p>
                      We may create aggregated, anonymized, or de-identified
                      data from the information we collect. This data cannot be
                      used to identify you personally and may be used for
                      research, analytics, industry insights, and to improve our
                      services. We may share this anonymized data with partners,
                      researchers, or the public.
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      5.3 Meta Platform Data Sharing
                    </h3>
                    <p>
                      Data accessed through the Meta Platform API (Instagram
                      data) is governed by Meta&apos;s Platform Terms and Data
                      Policy in addition to this privacy policy. We do not share
                      your Instagram data with Meta beyond what is required for
                      API authentication and functionality. You can review and
                      revoke Collabo&apos;s access to your Instagram data at any
                      time through your Instagram account settings.
                    </p>
                  </div>
                </div>
              </section>

              {/* 6. Data Retention */}
              <section>
                <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We retain your personal data and Instagram data only for as
                    long as necessary to fulfill the purposes outlined in this
                    privacy policy, comply with legal obligations, resolve
                    disputes, and enforce our agreements.
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      6.1 Active Accounts
                    </h3>
                    <p>
                      As long as your Collabo account remains active, we will
                      retain your account information, Instagram data, campaign
                      history, and associated data to provide you with
                      continuous service and maintain the functionality of the
                      platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      6.2 Inactive Accounts
                    </h3>
                    <p>
                      If your account has been inactive (no login) for 24
                      consecutive months, we may send you a notification at your
                      registered email address. If you do not respond within 60
                      days, we may deactivate your account and begin the data
                      deletion process, unless we have a legal obligation to
                      retain certain information.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      6.3 Account Deletion
                    </h3>
                    <p>
                      When you request account deletion (see Section 7 below),
                      we will permanently delete your personal data and
                      Instagram data within 30 days, except where we are
                      required or permitted by law to retain certain information
                      (e.g., for tax, legal, or regulatory purposes).
                    </p>
                    <p className="mt-2">
                      <strong className="text-foreground">
                        What happens when you delete your account:
                      </strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 ml-4 mt-2">
                      <li>
                        Your profile and account information will be permanently
                        deleted
                      </li>
                      <li>
                        All Instagram data collected through the Meta API will
                        be deleted from our databases
                      </li>
                      <li>
                        Your OAuth access tokens will be revoked and deleted
                      </li>
                      <li>
                        Your campaign history and collaboration records will be
                        anonymized or deleted
                      </li>
                      <li>
                        Your saved preferences, analytics data, and dashboard
                        information will be deleted
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      6.4 Legal Retention Requirements
                    </h3>
                    <p>
                      Certain data may be retained for longer periods when
                      required by law, such as:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 ml-4 mt-2">
                      <li>
                        Transaction records and invoices (for tax and accounting
                        purposes, typically 7 years)
                      </li>
                      <li>
                        Data needed to comply with legal holds, litigation, or
                        regulatory investigations
                      </li>
                      <li>
                        Anonymized or aggregated data used for research and
                        analytics (which cannot identify you)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      6.5 Backup Systems
                    </h3>
                    <p>
                      Due to our backup and disaster recovery systems, deleted
                      data may persist in backup copies for up to 90 days after
                      deletion. These backups are securely stored and
                      inaccessible for normal operations. Backup data is
                      automatically purged according to our retention schedules.
                    </p>
                  </div>
                </div>
              </section>

              {/* 7. Data Deletion Instructions - VERY IMPORTANT FOR META */}
              <section className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                  7. How to Request Data Deletion (IMPORTANT)
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground text-lg">
                    You have the right to request deletion of your personal data
                    and Instagram data at any time. We provide multiple
                    convenient methods to do so:
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      7.1 Delete Your Account Through the Dashboard
                    </h3>
                    <p className="mb-2">
                      <strong className="text-foreground">
                        Fastest Method - Immediate Deletion:
                      </strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>
                        Log in to your Collabo account at{" "}
                        <a
                          href="https://collabo.com"
                          className="text-primary hover:underline"
                        >
                          https://collabo.com
                        </a>
                      </li>
                      <li>
                        Navigate to{" "}
                        <strong className="text-foreground">Settings</strong> →{" "}
                        <strong className="text-foreground">
                          Account Settings
                        </strong>
                      </li>
                      <li>
                        Scroll to the bottom and click{" "}
                        <strong className="text-foreground">
                          &quot;Delete Account&quot;
                        </strong>
                      </li>
                      <li>Confirm your decision by entering your password</li>
                      <li>
                        Click{" "}
                        <strong className="text-foreground">
                          &quot;Permanently Delete My Account&quot;
                        </strong>
                      </li>
                    </ol>
                    <p className="mt-2 text-sm bg-white dark:bg-gray-900 rounded p-2 border border-blue-200 dark:border-blue-800">
                      Your account and all associated data will be queued for
                      deletion immediately and will be permanently removed
                      within 30 days.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      7.2 Email Data Deletion Request
                    </h3>
                    <p className="mb-2">
                      If you prefer to request deletion via email or if you
                      cannot access your account:
                    </p>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="font-semibold text-foreground">
                        Send an email to:
                      </p>
                      <p className="text-xl font-bold text-primary my-2">
                        <a
                          href="mailto:privacy@collabo.com"
                          className="hover:underline"
                        >
                          privacy@collabo.com
                        </a>
                      </p>
                      <p className="font-semibold text-foreground mt-3">
                        Subject Line:
                      </p>
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        Data Deletion Request - [Your Full Name]
                      </p>
                      <p className="font-semibold text-foreground mt-3">
                        Include in your email:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                        <li>Your full name as registered on Collabo</li>
                        <li>The email address associated with your account</li>
                        <li>Your Collabo username (if known)</li>
                        <li>
                          A clear statement that you wish to delete your account
                          and all associated data
                        </li>
                        <li>Any specific concerns or reasons (optional)</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      7.3 Deletion Timeline
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <strong className="text-foreground">
                          Step 1 - Immediate (0-24 hours):
                        </strong>
                      </p>
                      <ul className="list-disc list-inside ml-4 mb-3">
                        <li>Your request is received and verified</li>
                        <li>
                          You will receive an email confirmation acknowledging
                          your deletion request
                        </li>
                        <li>
                          Your account will be immediately deactivated (you will
                          no longer be able to log in)
                        </li>
                      </ul>

                      <p>
                        <strong className="text-foreground">
                          Step 2 - Within 7 Days:
                        </strong>
                      </p>
                      <ul className="list-disc list-inside ml-4 mb-3">
                        <li>Your Instagram OAuth access tokens are revoked</li>
                        <li>Your profile becomes invisible to other users</li>
                        <li>
                          Active campaigns and collaborations are terminated
                        </li>
                      </ul>

                      <p>
                        <strong className="text-foreground">
                          Step 3 - Within 30 Days:
                        </strong>
                      </p>
                      <ul className="list-disc list-inside ml-4 mb-3">
                        <li>
                          All personal data is permanently deleted from our
                          production databases
                        </li>
                        <li>
                          All Instagram data (profile info, metrics, insights)
                          is permanently deleted
                        </li>
                        <li>
                          OAuth tokens and authentication credentials are
                          permanently deleted
                        </li>
                        <li>
                          You will receive a final confirmation email that
                          deletion is complete
                        </li>
                      </ul>

                      <p>
                        <strong className="text-foreground">
                          Step 4 - Within 90 Days:
                        </strong>
                      </p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Data is purged from backup systems</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      7.4 What Data Cannot Be Deleted
                    </h3>
                    <p className="mb-2">
                      Certain limited data may be retained even after account
                      deletion when required by law:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 ml-4">
                      <li>
                        Transaction records and invoices (required for tax
                        compliance, typically 7 years)
                      </li>
                      <li>
                        Data subject to legal holds or ongoing legal proceedings
                      </li>
                      <li>
                        Anonymized or aggregated analytics data that cannot
                        identify you personally
                      </li>
                      <li>
                        Minimal records needed to prevent you from
                        re-registering with a previously banned account (if
                        applicable)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      7.5 Instagram Data Deletion from Meta
                    </h3>
                    <p>
                      When you delete your Collabo account, we delete all
                      Instagram data from our systems. However, this does not
                      delete your Instagram account or data stored by
                      Meta/Instagram. To manage your Instagram data and
                      authorized apps:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 ml-4 mt-2">
                      <li>Go to your Instagram app or Instagram.com</li>
                      <li>
                        Navigate to Settings → Security → Apps and Websites
                      </li>
                      <li>
                        Find &quot;Collabo&quot; in the list of authorized apps
                      </li>
                      <li>
                        Click &quot;Remove&quot; to revoke Collabo&apos;s access
                      </li>
                    </ol>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 mt-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Need Help?
                    </h3>
                    <p>
                      If you encounter any issues with account deletion or have
                      questions about the process, please contact us at{" "}
                      <a
                        href="mailto:privacy@collabo.com"
                        className="text-primary hover:underline font-semibold"
                      >
                        privacy@collabo.com
                      </a>{" "}
                      or{" "}
                      <a
                        href="mailto:support@collabo.com"
                        className="text-primary hover:underline font-semibold"
                      >
                        support@collabo.com
                      </a>
                      . We are committed to honoring your data deletion requests
                      promptly and completely.
                    </p>
                  </div>
                </div>
              </section>

              {/* 8. Your Rights and Choices */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  8. Your Rights and Choices
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Depending on your location and applicable privacy laws
                    (including GDPR, CCPA, and other regulations), you have
                    certain rights regarding your personal data:
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      8.1 Right to Access
                    </h3>
                    <p>
                      You have the right to request a copy of the personal data
                      we hold about you. You can download your data through your
                      dashboard (Settings → Privacy → Download My Data) or by
                      emailing{" "}
                      <a
                        href="mailto:privacy@collabo.com"
                        className="text-primary hover:underline"
                      >
                        privacy@collabo.com
                      </a>
                      .
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      8.2 Right to Correction
                    </h3>
                    <p>
                      You can update your account information, profile details,
                      and preferences at any time through your account settings.
                      If you need assistance correcting your data, contact us at{" "}
                      <a
                        href="mailto:support@collabo.com"
                        className="text-primary hover:underline"
                      >
                        support@collabo.com
                      </a>
                      .
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      8.3 Right to Deletion
                    </h3>
                    <p>
                      You have the right to request deletion of your data as
                      described in Section 7 above.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      8.4 Right to Restrict Processing
                    </h3>
                    <p>
                      You can request that we limit how we use your data. For
                      example, you can opt out of marketing communications while
                      continuing to use the platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      8.5 Right to Data Portability
                    </h3>
                    <p>
                      You have the right to receive your data in a structured,
                      commonly used, machine-readable format (JSON or CSV) and
                      to transfer it to another service. Request data export
                      through your dashboard or by contacting us.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      8.6 Right to Object
                    </h3>
                    <p>
                      You can object to certain types of data processing,
                      including processing for direct marketing purposes. You
                      can manage your email preferences in Settings →
                      Notifications.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      8.7 Right to Withdraw Consent
                    </h3>
                    <p>
                      You can withdraw your consent for Instagram data access at
                      any time by:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 ml-4 mt-2">
                      <li>
                        Disconnecting Instagram in Settings → Connected Accounts
                        → Instagram → Disconnect
                      </li>
                      <li>
                        Revoking access through your Instagram account settings
                      </li>
                    </ul>
                    <p className="mt-2">
                      Note: Disconnecting Instagram will limit certain platform
                      features that rely on Instagram data.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      8.8 Right to Lodge a Complaint
                    </h3>
                    <p>
                      If you believe we have not handled your personal data
                      properly, you have the right to lodge a complaint with
                      your local data protection authority.
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Exercising Your Rights
                    </h3>
                    <p>
                      To exercise any of these rights, please contact us at{" "}
                      <a
                        href="mailto:privacy@collabo.com"
                        className="text-primary hover:underline font-semibold"
                      >
                        privacy@collabo.com
                      </a>
                      . We will respond to your request within 30 days. We may
                      need to verify your identity before processing certain
                      requests.
                    </p>
                  </div>
                </div>
              </section>

              {/* 9. Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  9. Cookies and Tracking Technologies
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Collabo uses cookies and similar tracking technologies to
                    enhance your experience, analyze usage patterns, and improve
                    our services.
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      9.1 What Are Cookies?
                    </h3>
                    <p>
                      Cookies are small text files stored on your device when
                      you visit a website. They help us remember your
                      preferences, keep you logged in, and understand how you
                      use our platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      9.2 Types of Cookies We Use
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong className="text-foreground">
                          Essential Cookies:
                        </strong>{" "}
                        Required for the platform to function (authentication,
                        security, session management). These cannot be disabled.
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Performance Cookies:
                        </strong>{" "}
                        Help us understand how users interact with the platform
                        (page views, navigation paths, error tracking).
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Functionality Cookies:
                        </strong>{" "}
                        Remember your preferences (theme, language, dashboard
                        layout).
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Analytics Cookies:
                        </strong>{" "}
                        Provide insights into platform usage to help us improve
                        features and user experience.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      9.3 Managing Cookies
                    </h3>
                    <p>
                      You can control cookies through your browser settings.
                      However, blocking certain cookies may affect platform
                      functionality. To manage cookie preferences on Collabo, go
                      to Settings → Privacy → Cookie Preferences.
                    </p>
                  </div>
                </div>
              </section>

              {/* 10. Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  10. Children&apos;s Privacy
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Collabo is not intended for use by individuals under the age
                    of 18. We do not knowingly collect personal information from
                    children under 18. If we become aware that we have collected
                    data from a child under 18, we will take steps to delete
                    that information promptly.
                  </p>
                  <p>
                    If you are a parent or guardian and believe your child has
                    provided us with personal information, please contact us at{" "}
                    <a
                      href="mailto:privacy@collabo.com"
                      className="text-primary hover:underline"
                    >
                      privacy@collabo.com
                    </a>
                    .
                  </p>
                </div>
              </section>

              {/* 11. International Data Transfers */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  11. International Data Transfers
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Collabo operates globally and may transfer your data to
                    countries outside your country of residence, including
                    countries that may have different data protection laws. When
                    we transfer data internationally, we implement appropriate
                    safeguards such as:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 ml-4">
                    <li>
                      Standard Contractual Clauses (SCCs) approved by the
                      European Commission
                    </li>
                    <li>Adequacy decisions by regulatory authorities</li>
                    <li>Encryption and security measures during transfer</li>
                    <li>
                      Compliance with applicable data protection frameworks
                    </li>
                  </ul>
                  <p className="mt-3">
                    By using Collabo, you consent to the transfer of your
                    information to countries outside your country of residence
                    as described in this policy.
                  </p>
                </div>
              </section>

              {/* 12. Changes to This Privacy Policy */}
              <section>
                <h2 className="text-2xl font-bold mb-4">
                  12. Changes to This Privacy Policy
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We may update this Privacy Policy from time to time to
                    reflect changes in our practices, technology, legal
                    requirements, or other factors. When we make changes, we
                    will:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 ml-4">
                    <li>
                      Update the &quot;Last updated&quot; date at the top of
                      this page
                    </li>
                    <li>
                      Notify you via email or through a prominent notice on the
                      platform for material changes
                    </li>
                    <li>
                      Provide you with an opportunity to review the updated
                      policy before it takes effect
                    </li>
                  </ul>
                  <p className="mt-3">
                    We encourage you to review this Privacy Policy periodically.
                    Your continued use of Collabo after changes are posted
                    constitutes your acceptance of the updated policy.
                  </p>
                </div>
              </section>

              {/* 13. Contact Us */}
              <section className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  13. Contact Information
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p className="text-lg">
                    If you have any questions, concerns, or requests regarding
                    this Privacy Policy or how we handle your personal data,
                    please don&apos;t hesitate to contact us:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h3 className="font-semibold text-foreground mb-2">
                        General Inquiries
                      </h3>
                      <p>
                        <a
                          href="mailto:support@collabo.com"
                          className="text-primary hover:underline font-semibold text-lg"
                        >
                          support@collabo.com
                        </a>
                      </p>
                    </div>

                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h3 className="font-semibold text-foreground mb-2">
                        Privacy & Data Requests
                      </h3>
                      <p>
                        <a
                          href="mailto:privacy@collabo.com"
                          className="text-primary hover:underline font-semibold text-lg"
                        >
                          privacy@collabo.com
                        </a>
                      </p>
                    </div>

                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h3 className="font-semibold text-foreground mb-2">
                        Data Deletion Requests
                      </h3>
                      <p>
                        <a
                          href="mailto:privacy@collabo.com"
                          className="text-primary hover:underline font-semibold text-lg"
                        >
                          privacy@collabo.com
                        </a>
                      </p>
                      <p className="text-sm mt-1">
                        Subject: Data Deletion Request
                      </p>
                    </div>

                    <div className="bg-background rounded-lg p-4 border border-border">
                      <h3 className="font-semibold text-foreground mb-2">
                        Security Issues
                      </h3>
                      <p>
                        <a
                          href="mailto:security@collabo.com"
                          className="text-primary hover:underline font-semibold text-lg"
                        >
                          security@collabo.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-background rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">
                      Mailing Address:
                    </h3>
                    <address className="not-italic">
                      Collabo Inc.
                      <br />
                      123 Creator Street, Suite 500
                      <br />
                      San Francisco, CA 94102
                      <br />
                      United States
                    </address>
                  </div>

                  <p className="mt-4 text-sm">
                    <strong className="text-foreground">Response Time:</strong>{" "}
                    We aim to respond to all inquiries within 48 hours on
                    business days. For data deletion and access requests, we
                    will respond within 30 days as required by applicable
                    privacy laws.
                  </p>

                  <p className="mt-4 font-semibold text-foreground text-lg">
                    Thank you for trusting Collabo with your data. Your privacy
                    and security are our top priorities.
                  </p>
                </div>
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
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
