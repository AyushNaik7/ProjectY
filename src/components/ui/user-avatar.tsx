import Image from "next/image";

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_MAP: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-[12px]",
  lg: "h-14 w-14 text-[14px]",
  xl: "h-16 w-16 text-[16px]",
};

const COLORS = ["#E6F1FB", "#E1F5EE", "#FAEEDA", "#FCEBEB", "#EEF2FF", "#F1F5F9"];
const TEXT_COLORS = ["#185FA5", "#1D9E75", "#BA7517", "#A32D2D", "#334155", "#0F172A"];

function nameHash(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function UserAvatar({ name, src, size = "md" }: UserAvatarProps) {
  const hash = nameHash(name || "User");
  const idx = hash % COLORS.length;

  const cls = SIZE_MAP[size];

  if (src) {
    return (
      <span className={`relative inline-flex overflow-hidden rounded-full ${cls}`}>
        <Image src={src} alt={name} fill className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${cls}`}
      style={{ backgroundColor: COLORS[idx], color: TEXT_COLORS[idx] }}
    >
      {getInitials(name)}
    </span>
  );
}
