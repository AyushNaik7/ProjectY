interface StatusBadgeProps {
  status: string;
  variant?: "request" | "campaign" | "payment";
}

function resolveColors(status: string) {
  const s = status.toLowerCase();
  if (["accepted", "approved", "released", "active"].includes(s)) {
    return { bg: "#EAF3DE", fg: "#3B6D11" };
  }
  if (["pending", "revision_requested", "escrowed"].includes(s)) {
    return { bg: "#FAEEDA", fg: "#BA7517" };
  }
  if (["rejected", "failed", "refunded", "disputed"].includes(s)) {
    return { bg: "#FCEBEB", fg: "#A32D2D" };
  }
  return { bg: "#E6F1FB", fg: "#185FA5" };
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = resolveColors(status);
  return (
    <span className="inline-flex rounded-full px-2 py-1 text-[11px] font-medium capitalize" style={{ backgroundColor: c.bg, color: c.fg }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
