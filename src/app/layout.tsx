import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ClerkAuthProvider } from "@/context/ClerkAuthContext";

export const metadata: Metadata = {
  title: "Collabo — Where Brands Meet Creators",
  description:
    "India's premium creator-brand collaboration platform. Connect with top creators, launch campaigns, and grow your brand with data-driven matching.",
  keywords: [
    "creator platform",
    "brand deals",
    "influencer marketing",
    "India",
    "Instagram",
    "creator economy",
  ],
  openGraph: {
    title: "Collabo — Where Brands Meet Creators",
    description: "India's premium creator-brand collaboration platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background antialiased">
          <ThemeProvider>
            <ClerkAuthProvider>{children}</ClerkAuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
