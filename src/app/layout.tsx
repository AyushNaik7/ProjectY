import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ClerkAuthProvider } from "@/context/ClerkAuthContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "InstaCollab — Where Brands Meet Instagram Creators",
  description:
    "India's premium Instagram creator-brand collaboration platform. Connect with top Instagram influencers, launch campaigns, and grow your brand with AI-powered matching.",
  keywords: [
    "instagram influencer",
    "creator platform",
    "brand deals",
    "influencer marketing",
    "India",
    "Instagram",
    "creator economy",
  ],
  openGraph: {
    title: "InstaCollab — Where Brands Meet Instagram Creators",
    description: "India's premium Instagram creator-brand collaboration platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            <ThemeProvider>
              <ClerkAuthProvider>
                {children}
                <Toaster />
              </ClerkAuthProvider>
            </ThemeProvider>
          </ClerkProvider>
        ) : (
          <ThemeProvider>
            <ClerkAuthProvider>
              {children}
              <Toaster />
            </ClerkAuthProvider>
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}
