"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/ClerkAuthContext";
import { callCompleteBrandOnboarding } from "@/lib/functions";

const industries = [
  "D2C / E-commerce",
  "Fashion",
  "Beauty",
  "Tech",
  "EdTech",
  "FinTech",
  "Travel",
  "Food",
  "Other",
];

export default function BrandOnboardingPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (role === "creator") {
      router.push("/onboarding/creator");
    }
  }, [loading, user, role, router]);

  const canContinue = useMemo(() => {
    if (step === 1) return companyName.trim().length >= 2 && industry !== "";
    if (step === 2) return description.trim().length >= 20;
    if (step === 3)
      return (
        budgetMin !== "" &&
        budgetMax !== "" &&
        Number(budgetMin) >= 0 &&
        Number(budgetMax) >= Number(budgetMin)
      );
    return true;
  }, [step, companyName, industry, description, budgetMin, budgetMax]);

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await callCompleteBrandOnboarding({
        brandName: companyName,
        category: industry,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        website: website || undefined,
        description: description || undefined,
      });
      router.push("/dashboard/brand");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to complete onboarding";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const labels = ["Company", "Profile", "Budget", "Launch"];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:py-10">
      <div className="mx-auto max-w-[760px] rounded-xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[12px] text-slate-500">
            <span>Step {Math.min(step, 4)} of 4</span>
            <span>{labels[Math.min(step, 4) - 1]}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {labels.map((l, i) => (
              <div key={l} className="text-center">
                <div className="mx-auto h-2 rounded-full" style={{ backgroundColor: i + 1 <= step ? "var(--ic-blue)" : "#e2e8f0" }} />
                <p className="mt-1 text-[10px] text-slate-400">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 ? (
              <section>
                <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Company name and industry</h1>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-[12px] text-slate-500">Company name</label>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] text-slate-500">Industry</label>
                    <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]">
                      <option value="">Select industry</option>
                      {industries.map((x) => (
                        <option key={x} value={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section>
                <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Logo, website and description</h1>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-[12px] text-slate-500">Website</label>
                    <input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" placeholder="https://" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] text-slate-500">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                  </div>
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section>
                <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Typical budget range</h1>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[12px] text-slate-500">Min budget (₹)</label>
                    <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] text-slate-500">Max budget (₹)</label>
                    <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                  </div>
                </div>
              </section>
            ) : null}

            {step === 4 ? (
              <section>
                <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Create your first campaign now?</h1>
                <p className="mt-2 text-[13px] text-slate-500">You can publish immediately or skip and do it from dashboard.</p>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <button
                    onClick={submit}
                    disabled={saving}
                    className="rounded-md px-4 py-2 text-[14px] text-white"
                    style={{ backgroundColor: "var(--ic-blue)" }}
                  >
                    {saving ? "Saving..." : "Create profile + go dashboard"}
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/brand")}
                    className="rounded-md border border-slate-300 px-4 py-2 text-[14px]"
                  >
                    Skip for now
                  </button>
                </div>
              </section>
            ) : null}

            {error ? <p className="mt-3 text-[12px] text-red-700">{error}</p> : null}

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="w-full rounded-md border border-slate-300 px-4 py-2 text-[14px] disabled:opacity-40"
              >
                Back
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  disabled={!canContinue}
                  className="w-full rounded-md px-4 py-2 text-[14px] text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--ic-blue)" }}
                >
                  Continue
                </button>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
