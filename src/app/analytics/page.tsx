"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/context/ClerkAuthContext";

export default function AnalyticsPage() {
  const { role } = useAuth();

  const trendData = useMemo(
    () => [
      { label: "Mon", value: 12 },
      { label: "Tue", value: 19 },
      { label: "Wed", value: 16 },
      { label: "Thu", value: 24 },
      { label: "Fri", value: 28 },
      { label: "Sat", value: 22 },
      { label: "Sun", value: 31 },
    ],
    []
  );

  const barData = useMemo(
    () =>
      role === "brand"
        ? [
            { label: "Campaign A", value: 40 },
            { label: "Campaign B", value: 28 },
            { label: "Campaign C", value: 62 },
            { label: "Campaign D", value: 36 },
          ]
        : [
            { label: "Instagram", value: 52 },
            { label: "YouTube", value: 34 },
            { label: "TikTok", value: 22 },
          ],
    [role]
  );

  return (
    <DashboardShell>
      <section className="space-y-6">
        <header className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_10px_30px_rgba(26,40,90,0.08)]">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-2 text-sm text-slate-600">
            Real-time ready dashboard visualizations for your performance overview.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(26,40,90,0.08)]">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <LineChartIcon className="h-5 w-5 text-blue-600" />
              Weekly Trend
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_10px_30px_rgba(26,40,90,0.08)]">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5 text-violet-600" />
              Breakdown
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}
