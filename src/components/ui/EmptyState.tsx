import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: string;
}

export function EmptyState({ title, description, ctaLabel, ctaHref, icon }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <svg className="mx-auto h-10 w-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d={icon || "M12 8v8m4-4H8m12 0a8 8 0 11-16 0 8 8 0 0116 0z"} />
      </svg>
      <h3 className="mt-3 text-[15px] font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-[13px] text-slate-500">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className="mt-4 inline-flex rounded-md px-3 py-2 text-[13px] text-white" style={{ backgroundColor: "var(--ic-blue)" }}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
