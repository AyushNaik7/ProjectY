"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/ClerkAuthContext";
import { ArrowRight, CircleDashed } from "lucide-react";

const creatorSteps = ["Create your profile", "Get AI matches", "Apply and collaborate"];
const brandSteps = ["Create a campaign", "Review matched creators", "Approve and launch"];

export default function HomePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [howTab, setHowTab] = useState<"creator" | "brand">("creator");

  useEffect(() => {
    if (!loading && user && role === "creator") router.push("/dashboard/creator");
    if (!loading && user && role === "brand") router.push("/dashboard/brand");
    if (!loading && user && !role) router.push("/role-select");
  }, [loading, user, role, router]);

  if (loading || user) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  const activeSteps = howTab === "creator" ? creatorSteps : brandSteps;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[56px] max-w-[1180px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-md"
              style={{ background: "linear-gradient(135deg, #185FA5, #378ADD)" }}
            >
              <span className="h-3 w-3 rounded-sm bg-white" />
            </span>
            <span className="text-[14px] font-medium">InstaCollab</span>
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] text-slate-600 md:flex">
            <a href="#creators">For Creators</a>
            <a href="#brands">For Brands</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-md border border-slate-300 px-3 py-1.5 text-[13px]">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md px-3 py-1.5 text-[13px] text-white"
              style={{ backgroundColor: "var(--ic-blue)" }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
        <div>
          <h1 className="text-[28px] leading-tight md:text-[40px] md:leading-tight" style={{ fontWeight: 500 }}>
            India&apos;s smartest platform for creator-brand collabs
          </h1>
          <p className="mt-4 text-[18px] text-slate-600">
            Match faster, collaborate cleaner, and track everything in one workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-[14px] text-white"
              style={{ backgroundColor: "var(--ic-blue)" }}
            >
              I&apos;m a Creator <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-[14px]">
              I&apos;m a Brand <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-slate-500">Trusted by 2,500+ brands and 10,000+ creators</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-[11px] text-slate-500">Match Feed</p>
              <p className="mt-1 text-[14px]" style={{ fontWeight: 500 }}>
                92% fit campaigns
              </p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-[11px] text-slate-500">Pending Requests</p>
              <p className="mt-1 text-[14px]" style={{ fontWeight: 500 }}>
                18 requests
              </p>
            </div>
            <div className="col-span-2 rounded-md border border-slate-200 p-3">
              <p className="text-[11px] text-slate-500">Pipeline</p>
              <div className="mt-2 h-2 rounded bg-slate-100">
                <div className="h-2 rounded" style={{ width: "68%", backgroundColor: "var(--ic-teal)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-[1180px] gap-3 overflow-x-auto px-4">
          {["D2C", "Beauty", "SaaS", "Travel", "Fintech", "Edtech"].map((x) => (
            <span key={x} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[12px] text-slate-600">
              <CircleDashed className="h-3 w-3" /> {x}
            </span>
          ))}
        </div>
      </section>

      <section id="creators" className="mx-auto max-w-[1180px] px-4 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-[20px]" style={{ fontWeight: 500 }}>
              AI that actually understands your content
            </h3>
            <p className="mt-2 text-[13px] text-slate-600">
              Semantic profile matching combines niche, engagement quality, and budget fit.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-[20px]" style={{ fontWeight: 500 }}>
              Find brands that fit your niche perfectly
            </h3>
            <p className="mt-2 text-[13px] text-slate-600">
              Get ranked opportunities and clear reasons behind each recommendation.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-10">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-4 px-4 md:grid-cols-4">
          {["10,000+ Creators", "2,500+ Brands", "₹2Cr+ Paid Out", "4.9★ Average Rating"].map((s) => (
            <div key={s} className="rounded-md border border-slate-200 bg-white p-4 text-center text-[16px]" style={{ fontWeight: 500 }}>
              {s}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-12" id="brands">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setHowTab("creator")}
            className="rounded-full px-3 py-1 text-[12px]"
            style={{
              backgroundColor: howTab === "creator" ? "var(--ic-blue-light)" : "#fff",
              color: howTab === "creator" ? "var(--ic-blue)" : "#64748b",
            }}
          >
            Creator flow
          </button>
          <button
            onClick={() => setHowTab("brand")}
            className="rounded-full px-3 py-1 text-[12px]"
            style={{
              backgroundColor: howTab === "brand" ? "var(--ic-blue-light)" : "#fff",
              color: howTab === "brand" ? "var(--ic-blue)" : "#64748b",
            }}
          >
            Brand flow
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {activeSteps.map((s, i) => (
            <div key={s} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-[12px]">
                {i + 1}
              </span>
              <p className="mt-3 text-[14px]" style={{ fontWeight: 500 }}>
                {s}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          <div>
            <p className="text-[14px]" style={{ fontWeight: 500 }}>
              InstaCollab
            </p>
            <p className="mt-1 text-[12px] text-slate-500">Creator-brand collabs, simplified.</p>
          </div>
          <div>
            <p className="text-[13px]" style={{ fontWeight: 500 }}>
              Product
            </p>
            <p className="mt-1 text-[12px] text-slate-500">Campaigns</p>
          </div>
          <div>
            <p className="text-[13px]" style={{ fontWeight: 500 }}>
              Resources
            </p>
            <p className="mt-1 text-[12px] text-slate-500">Help Center</p>
          </div>
          <div>
            <p className="text-[13px]" style={{ fontWeight: 500 }}>
              Legal
            </p>
            <p className="mt-1 text-[12px] text-slate-500">Terms · Privacy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
