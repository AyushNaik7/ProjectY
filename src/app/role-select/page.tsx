"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Briefcase, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/ClerkAuthContext";

export default function RoleSelectPage() {
  const router = useRouter();
  const { user, loading, role, setRole } = useAuth();
  const [selected, setSelected] = useState<"creator" | "brand" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const onboardingComplete = user.publicMetadata?.onboarding_complete;
    if (role === "creator") {
      router.push(onboardingComplete ? "/dashboard/creator" : "/onboarding/creator");
    }
    if (role === "brand") {
      router.push(onboardingComplete ? "/dashboard/brand" : "/onboarding/brand");
    }
  }, [loading, user, role, router]);

  const onContinue = async () => {
    if (!selected) return;
    setSaving(true);
    await setRole(selected);
    router.push(selected === "creator" ? "/onboarding/creator" : "/onboarding/brand");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-[860px]">
        <div className="mx-auto max-w-[720px] rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <h1 className="text-center text-[28px] md:text-[32px]" style={{ fontWeight: 500 }}>
            What describes you best?
          </h1>
          <p className="mt-2 text-center text-[14px] text-slate-500">Choose one option to personalize your workspace</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setSelected("creator")}
              className="relative rounded-lg border p-5 text-left"
              style={{ borderColor: selected === "creator" ? "var(--ic-blue)" : "#e2e8f0", borderWidth: selected === "creator" ? 2 : 1 }}
            >
              {selected === "creator" ? <CheckCircle2 className="absolute right-3 top-3 h-5 w-5" style={{ color: "var(--ic-blue)" }} /> : null}
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: "var(--ic-blue-light)" }}>
                <UserCircle2 className="h-5 w-5" style={{ color: "var(--ic-blue)" }} />
              </div>
              <p className="mt-4 text-[18px]" style={{ fontWeight: 500 }}>I&apos;m a Creator</p>
              <p className="mt-1 text-[13px] text-slate-500">Get discovered by brands and manage your collaborations in one place.</p>
            </button>

            <button
              onClick={() => setSelected("brand")}
              className="relative rounded-lg border p-5 text-left"
              style={{ borderColor: selected === "brand" ? "var(--ic-blue)" : "#e2e8f0", borderWidth: selected === "brand" ? 2 : 1 }}
            >
              {selected === "brand" ? <CheckCircle2 className="absolute right-3 top-3 h-5 w-5" style={{ color: "var(--ic-blue)" }} /> : null}
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: "var(--ic-blue-light)" }}>
                <Briefcase className="h-5 w-5" style={{ color: "var(--ic-blue)" }} />
              </div>
              <p className="mt-4 text-[18px]" style={{ fontWeight: 500 }}>I&apos;m a Brand</p>
              <p className="mt-1 text-[13px] text-slate-500">Launch campaigns, match creators, and run requests at scale.</p>
            </button>
          </div>

          <button
            disabled={!selected || saving}
            onClick={onContinue}
            className="mt-6 w-full rounded-md px-4 py-2.5 text-[14px] text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--ic-blue)" }}
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
