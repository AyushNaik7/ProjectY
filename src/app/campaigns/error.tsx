"use client";

import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";

interface CampaignsErrorProps {
  reset: () => void;
}

export default function CampaignsError({ reset }: CampaignsErrorProps) {
  return (
    <DashboardShell role="creator">
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-6 max-w-xl mx-auto mt-10">
        <h2 className="text-lg font-semibold text-red-700 mb-2">
          We could not load campaigns
        </h2>
        <p className="text-sm text-red-600 mb-4">
          This is usually temporary. Retry to fetch campaigns again.
        </p>
        <Button variant="outline" onClick={reset}>
          Retry
        </Button>
      </div>
    </DashboardShell>
  );
}
