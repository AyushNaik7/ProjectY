import Link from "next/link";

const links = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="mt-8 border-t border-white/10 bg-white/[0.03] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-400 md:flex-row md:px-8">
        <p>© {new Date().getFullYear()} InstaCollab. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-violet-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
