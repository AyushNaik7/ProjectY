import DashboardShell from "@/components/DashboardShell";

export default function LoadingCampaigns() {
  return (
    <DashboardShell role="creator">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="h-9 w-64 rounded-md bg-muted/50 animate-pulse" />
          <div className="h-10 w-36 rounded-md bg-muted/50 animate-pulse" />
        </div>
        <div className="h-16 rounded-xl border border-border bg-card animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-80 rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
