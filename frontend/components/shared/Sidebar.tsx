"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meals", label: "Meals" },
  { href: "/habits", label: "Habits" },
  { href: "/insights", label: "Insights" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/60 p-4 md:block">
      <div className="mb-5 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.2em]">Today</p>
        <p className="mt-2 text-xl font-semibold">Stay consistent</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
