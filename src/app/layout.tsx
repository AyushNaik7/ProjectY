import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SupabaseAuthProvider } from "@/context/SupabaseAuthContext";

export const metadata: Metadata = {
  title: "Collabo — Where Brands Meet Creators",
  description:
    "India's premium creator-brand collaboration platform. Connect with top creators, launch campaigns, and grow your brand with data-driven matching.",
  keywords: ["creator platform", "brand deals", "influencer marketing", "India", "Instagram", "creator economy"],
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
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          <SupabaseAuthProvider>
            <AuthProvider>{children}</AuthProvider>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
