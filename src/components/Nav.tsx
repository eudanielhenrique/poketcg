"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Buscar" },
  { href: "/collection", label: "Coleção" },
  { href: "/decks", label: "Decks" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-6 py-3.5 sm:px-8">
        <Link href="/" className="mr-4 flex items-center gap-2">
          <span className="relative h-5 w-5 overflow-hidden rounded-full border border-white/20 shadow-[0_0_0_1px_rgba(0,0,0,0.4)]">
            <span className="absolute inset-0 bg-gradient-to-b from-[#ff5f57] to-[#e0413a]" />
            <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-black/60" />
            <span className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/50 bg-white" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">PokeTCG</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                  active ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {active && <span className="absolute inset-0 rounded-full bg-surface-strong" />}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
