import DashboardShell from "@/components/DashboardShell";

export default function LoadingCreators() {
  return (
    <DashboardShell role="brand">
      <div className="space-y-6">
        <div className="h-9 w-56 rounded-md bg-muted/50 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
        <div className="h-32 rounded-xl border border-border bg-card animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-72 rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
