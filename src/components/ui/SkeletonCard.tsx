interface SkeletonCardProps {
  type: "campaign" | "creator";
}

export function SkeletonCard({ type }: SkeletonCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
      <div className="animate-pulse">
        <div className="h-2 w-full rounded bg-slate-100" />
        <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-full rounded bg-slate-100" />
        <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="h-8 rounded bg-slate-100" />
          <div className="h-8 rounded bg-slate-100" />
        </div>
        {type === "creator" ? <div className="mt-4 h-20 rounded bg-slate-100" /> : null}
      </div>
    </div>
  );
}
