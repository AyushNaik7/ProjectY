"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/ClerkAuthContext";
import { callCompleteCreatorOnboarding } from "@/lib/functions";

type Platform = "instagram" | "youtube" | "tiktok";

const niches = [
  "Fashion",
  "Beauty",
  "Tech",
  "Education",
  "Fitness",
  "Travel",
  "Food",
  "Gaming",
];

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [followers, setFollowers] = useState("");
  const [avgViews, setAvgViews] = useState("");
  const [engagement, setEngagement] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(["instagram"]);
  const [minRate, setMinRate] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (role === "brand") {
      router.push("/onboarding/brand");
    }
  }, [loading, user, role, router]);

  const canContinue = useMemo(() => {
    if (step === 1) return name.trim().length >= 2 && handle.trim().length >= 2;
    if (step === 2) return selectedNiches.length > 0 && selectedNiches.length <= 3;
    if (step === 3) return Number(followers) >= 0 && Number(avgViews) >= 0 && followers !== "" && avgViews !== "";
    if (step === 4) return Number(engagement) >= 0 && Number(engagement) <= 100 && platforms.length > 0;
    if (step === 5) return Number(minRate) >= 0 && bio.trim().length >= 20;
    return true;
  }, [step, name, handle, selectedNiches, followers, avgViews, engagement, platforms, minRate, bio]);

  const toggleNiche = (n: string) => {
    setSelectedNiches((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 3) return prev;
      return [...prev, n];
    });
  };

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const submit = async () => {
    if (!user) return;
    setError("");
    setSaving(true);
    try {
      await callCompleteCreatorOnboarding({
        name: name.trim(),
        instagramHandle: handle.replace(/^@/, ""),
        niche: selectedNiches.join(", "),
        followers: Number(followers || 0),
        avgViews: Number(avgViews || 0),
        engagementRate: Number(engagement || 0),
        minRatePrivate: Number(minRate || 0),
      });
      setDone(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to complete onboarding";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const labels = ["Basic", "Niche", "Audience", "Engagement", "Rate"];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:py-10">
      <div className="mx-auto max-w-[760px] rounded-xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[12px] text-slate-500">
            <span>Step {Math.min(step, 5)} of 5</span>
            <span>{labels[Math.min(step, 5) - 1]}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {labels.map((l, i) => (
              <div key={l} className="text-center">
                <div className="mx-auto h-2 rounded-full" style={{ backgroundColor: i + 1 <= step ? "var(--ic-blue)" : "#e2e8f0" }} />
                <p className="mt-1 text-[10px] text-slate-400">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 ? (
                <section>
                  <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Your name and Instagram handle</h1>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-[12px] text-slate-500">Name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] text-slate-500">Instagram handle</label>
                      <div className="flex items-center rounded-md border border-slate-300 px-3">
                        <span className="text-slate-400">@</span>
                        <input value={handle} onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))} className="w-full px-1 py-2 text-[14px] outline-none" />
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {step === 2 ? (
                <section>
                  <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Pick your niche (up to 3)</h1>
                  <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {niches.map((n) => (
                      <button
                        key={n}
                        onClick={() => toggleNiche(n)}
                        className="rounded-md border px-3 py-2 text-[13px]"
                        style={{
                          borderColor: selectedNiches.includes(n) ? "var(--ic-blue)" : "#e2e8f0",
                          backgroundColor: selectedNiches.includes(n) ? "var(--ic-blue-light)" : "#fff",
                          color: selectedNiches.includes(n) ? "var(--ic-blue)" : "#334155",
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {step === 3 ? (
                <section>
                  <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Your audience size</h1>
                  <p className="mt-1 text-[12px] text-slate-500">Where to find this: Instagram Insights</p>
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[12px] text-slate-500">Followers</label>
                      <input type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] text-slate-500">Average views</label>
                      <input type="number" value={avgViews} onChange={(e) => setAvgViews(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                    </div>
                  </div>
                </section>
              ) : null}

              {step === 4 ? (
                <section>
                  <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Your engagement</h1>
                  <div className="mt-4">
                    <label className="mb-1 block text-[12px] text-slate-500">Engagement %</label>
                    <input type="number" step="0.1" min={0} max={100} value={engagement} onChange={(e) => setEngagement(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["instagram", "youtube", "tiktok"] as Platform[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className="rounded-full border px-3 py-1.5 text-[12px]"
                        style={{
                          borderColor: platforms.includes(p) ? "var(--ic-blue)" : "#e2e8f0",
                          backgroundColor: platforms.includes(p) ? "var(--ic-blue-light)" : "#fff",
                          color: platforms.includes(p) ? "var(--ic-blue)" : "#64748b",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {step === 5 ? (
                <section>
                  <h1 className="text-[22px]" style={{ fontWeight: 500 }}>Your rate and bio</h1>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-[12px] text-slate-500">Min rate (private)</label>
                      <div className="flex items-center rounded-md border border-slate-300 px-3">
                        <span className="text-slate-400">₹</span>
                        <input type="number" value={minRate} onChange={(e) => setMinRate(e.target.value)} className="w-full px-1 py-2 text-[14px] outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] text-slate-500">Bio</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" />
                    </div>
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
                {step < 5 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(5, s + 1))}
                    disabled={!canContinue}
                    className="w-full rounded-md px-4 py-2 text-[14px] text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--ic-blue)" }}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={!canContinue || saving}
                    className="w-full rounded-md px-4 py-2 text-[14px] text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--ic-blue)" }}
                  >
                    {saving ? "Saving..." : "Finish"}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-center text-[24px]" style={{ fontWeight: 500 }}>You&apos;re all set</h1>
              <p className="mt-2 text-center text-[14px] text-slate-500">Let&apos;s find your first campaign.</p>
              <button
                onClick={() => router.push("/dashboard/creator")}
                className="mt-6 w-full rounded-md px-4 py-2 text-[14px] text-white"
                style={{ backgroundColor: "var(--ic-blue)" }}
              >
                Go to dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
