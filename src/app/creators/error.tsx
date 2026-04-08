"use client";

import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";

interface CreatorsErrorProps {
  reset: () => void;
}

export default function CreatorsError({ reset }: CreatorsErrorProps) {
  return (
    <DashboardShell role="brand">
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-6 max-w-xl mx-auto mt-10">
        <h2 className="text-lg font-semibold text-red-700 mb-2">
          We hit an error while loading creators
        </h2>
        <p className="text-sm text-red-600 mb-4">
          The directory is temporarily unavailable. Retry once to continue.
        </p>
        <Button variant="outline" onClick={reset}>
          Retry
        </Button>
      </div>
    </DashboardShell>
  );
}
