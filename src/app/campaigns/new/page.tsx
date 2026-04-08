"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/ClerkAuthContext";
import DashboardShell from "@/components/DashboardShell";
import { callCreateCampaign } from "@/lib/functions";

type PaymentType = "fixed" | "negotiable" | "performance";

const niches = [
  "Fashion & Lifestyle",
  "Tech & Gadgets",
  "Beauty & Skincare",
  "Travel & Adventure",
  "Food & Cooking",
  "Fitness & Health",
  "Gaming",
  "Education & Learning",
  "Finance & Business",
  "Any",
];

export default function CampaignCreatePage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("Reel");
  const [guidelines, setGuidelines] = useState("");
  const [budgetMin, setBudgetMin] = useState("10000");
  const [budgetMax, setBudgetMax] = useState("25000");
  const [timeline, setTimeline] = useState("2 Weeks");
  const [spots, setSpots] = useState("5");
  const [endDate, setEndDate] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("fixed");

  useEffect(() => {
    if (!loading && (!user || role !== "brand")) {
      router.push("/login");
    }
  }, [loading, user, role, router]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (title.trim().length < 3) e.title = "Title must be at least 3 characters";
    if (description.trim().length < 10) e.description = "Description must be at least 10 characters";
    if (!niche) e.niche = "Niche is required";
    if (Number(budgetMin) <= 0) e.budgetMin = "Enter valid min budget";
    if (Number(budgetMax) < Number(budgetMin)) e.budgetMax = "Max budget must be >= min budget";
    if (!timeline) e.timeline = "Timeline is required";
    if (Number(spots) <= 0) e.spots = "Spots must be greater than 0";
    return e;
  }, [title, description, niche, budgetMin, budgetMax, timeline, spots]);

  const canSubmit = Object.keys(errors).length === 0;

  const publish = async () => {
    setError("");
    if (!canSubmit) return;
    setSaving(true);
    try {
      await callCreateCampaign({
        title: title.trim(),
        description: description.trim(),
        deliverableType: platform === "Story" ? "Story" : platform === "Post" ? "Post" : "Reel",
        budget: Number(budgetMax),
        timeline,
        niche,
      });
      router.push("/dashboard/brand");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to publish campaign";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || role !== "brand") {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <DashboardShell role="brand">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6">
            <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Create Campaign</h1>
            <p className="mt-1 text-[13px] text-slate-500">Set your campaign details and preview it live.</p>

            <section className="mt-6 border-b border-slate-200 pb-5">
              <h2 className="text-[14px] text-slate-900" style={{ fontWeight: 500 }}>Campaign basics</h2>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-[12px] text-slate-500">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border px-3 py-2 text-[14px]" style={{ borderColor: errors.title ? "#A32D2D" : "#cbd5e1" }} />
                  {errors.title ? <p className="mt-1 text-[11px] text-red-700">{errors.title}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-slate-500">Description ({description.length}/350)</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 350))} rows={4} className="w-full rounded-md border px-3 py-2 text-[14px]" style={{ borderColor: errors.description ? "#A32D2D" : "#cbd5e1" }} />
                  {errors.description ? <p className="mt-1 text-[11px] text-red-700">{errors.description}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-slate-500">Niche</label>
                  <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]">
                    <option value="">Select niche</option>
                    {niches.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  {errors.niche ? <p className="mt-1 text-[11px] text-red-700">{errors.niche}</p> : null}
                </div>
              </div>
            </section>

            <section className="mt-5 border-b border-slate-200 pb-5">
              <h2 className="text-[14px] text-slate-900" style={{ fontWeight: 500 }}>Content details</h2>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-[12px] text-slate-500">Platform</label>
                  <div className="flex gap-2">
                    {["Reel", "Post", "Story"].map((p) => (
                      <button key={p} onClick={() => setPlatform(p)} className="rounded-full border px-3 py-1.5 text-[12px]"
                        style={{ borderColor: platform === p ? "var(--ic-blue)" : "#cbd5e1", color: platform === p ? "var(--ic-blue)" : "#64748b", backgroundColor: platform === p ? "var(--ic-blue-light)" : "#fff" }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-slate-500">Content guidelines</label>
                  <textarea value={guidelines} onChange={(e) => setGuidelines(e.target.value)} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                </div>
              </div>
            </section>

            <section className="mt-5 border-b border-slate-200 pb-5">
              <h2 className="text-[14px] text-slate-900" style={{ fontWeight: 500 }}>Budget and timeline</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[12px] text-slate-500">Min budget (₹)</label>
                  <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="w-full rounded-md border px-3 py-2 text-[14px]" style={{ borderColor: errors.budgetMin ? "#A32D2D" : "#cbd5e1" }} />
                  {errors.budgetMin ? <p className="mt-1 text-[11px] text-red-700">{errors.budgetMin}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-slate-500">Max budget (₹)</label>
                  <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="w-full rounded-md border px-3 py-2 text-[14px]" style={{ borderColor: errors.budgetMax ? "#A32D2D" : "#cbd5e1" }} />
                  {errors.budgetMax ? <p className="mt-1 text-[11px] text-red-700">{errors.budgetMax}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-slate-500">Timeline</label>
                  <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]">
                    {["1 Week", "2 Weeks", "1 Month", "2 Months"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[12px] text-slate-500">Spots</label>
                  <input type="number" value={spots} onChange={(e) => setSpots(e.target.value)} className="w-full rounded-md border px-3 py-2 text-[14px]" style={{ borderColor: errors.spots ? "#A32D2D" : "#cbd5e1" }} />
                  {errors.spots ? <p className="mt-1 text-[11px] text-red-700">{errors.spots}</p> : null}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[12px] text-slate-500">End date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                </div>
              </div>
            </section>

            <section className="mt-5 pb-2">
              <h2 className="text-[14px] text-slate-900" style={{ fontWeight: 500 }}>Payment type</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {([
                  { key: "fixed", label: "Fixed" },
                  { key: "negotiable", label: "Negotiable" },
                  { key: "performance", label: "Performance-based" },
                ] as { key: PaymentType; label: string }[]).map((x) => (
                  <button
                    key={x.key}
                    onClick={() => setPaymentType(x.key)}
                    className="rounded-md border p-3 text-left"
                    style={{ borderColor: paymentType === x.key ? "var(--ic-blue)" : "#cbd5e1", backgroundColor: paymentType === x.key ? "var(--ic-blue-light)" : "#fff" }}
                  >
                    <p className="text-[13px]" style={{ fontWeight: 500 }}>{x.label}</p>
                  </button>
                ))}
              </div>
            </section>

            {error ? <p className="mt-3 text-[12px] text-red-700">{error}</p> : null}

            <button
              onClick={publish}
              disabled={!canSubmit || saving}
              className="mt-5 w-full rounded-md px-4 py-2.5 text-[14px] text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--ic-blue)" }}
            >
              {saving ? "Publishing..." : "Publish Campaign"}
            </button>
            <button onClick={() => router.push("/dashboard/brand")} className="mt-2 w-full text-[13px] text-slate-500">
              Save as Draft
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-[72px] rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[13px] text-slate-500">Live preview</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="h-1" style={{ backgroundColor: "var(--ic-blue-mid)" }} />
              <div className="p-4">
                <p className="text-[12px] text-slate-500">Your Brand</p>
                <h3 className="mt-1 line-clamp-2 text-[15px]" style={{ fontWeight: 500 }}>{title || "Campaign title"}</h3>
                <p className="mt-2 line-clamp-2 text-[13px] text-slate-500">{description || "Campaign description preview appears here."}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{platform}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{paymentType}</span>
                  {niche ? <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{niche}</span> : null}
                </div>
                <p className="mt-3 text-[14px]" style={{ fontWeight: 500 }}>₹{Number(budgetMin || 0).toLocaleString()} - ₹{Number(budgetMax || 0).toLocaleString()}</p>
                <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
                  <span>{spots} spots</span>
                  <span>{timeline}</span>
                </div>
                <button className="mt-4 w-full rounded-md px-3 py-2 text-[13px] text-white" style={{ backgroundColor: "var(--ic-blue)" }}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
