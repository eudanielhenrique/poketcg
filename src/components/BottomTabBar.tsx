"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Buscar",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/collection",
    label: "Coleção",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
        <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
        <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
        <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      </svg>
    ),
  },
  {
    href: "/decks",
    label: "Decks",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="5" y="7" width="12" height="15" rx="2" transform="rotate(-8 11 14.5)" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
        <rect x="7" y="3" width="12" height="15" rx="2" fill="var(--background)" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      </svg>
    ),
  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 active:scale-95 transition-transform duration-150"
            >
              <span className={active ? "text-accent" : "text-muted"}>{tab.icon(active)}</span>
              <span className={`text-[10px] font-medium ${active ? "text-accent" : "text-muted"}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
