"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dnes",
    icon: (active: boolean) => (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/klientky",
    label: "Klientky",
    icon: (active: boolean) => (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" />
      </svg>
    ),
  },
  {
    href: "/nastaveni",
    label: "Nastavení",
    icon: (active: boolean) => (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Hlavni navigace" className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex justify-around items-center max-w-md mx-auto" style={{height: "80px", paddingBottom: "env(safe-area-inset-bottom, 0px)"}}>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1.5 px-4 py-3 transition-colors ${
              active ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {item.icon(active)}
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
