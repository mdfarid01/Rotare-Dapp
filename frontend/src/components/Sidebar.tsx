"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Wallet, Coins, LineChart, PlusCircle, Gavel, LayoutDashboard } from "lucide-react";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deposit", label: "Deposit", icon: Wallet },
  { href: "/bid", label: "Bid", icon: Gavel },
  { href: "/create-pot", label: "Create Pot", icon: PlusCircle },
  { href: "/liquidity", label: "Liquidity", icon: LineChart },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-full w-60 shrink-0 border-r border-border/60 bg-white/5 dark:bg-black/20 backdrop-blur-xl">
      <div className="p-4">
        <Link href="/" className="block">
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            <span className="font-semibold tracking-wide">Chainpot Hub</span>
          </div>
        </Link>
      </div>
      <nav className="px-2 py-2 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                "hover:bg-primary/10 hover:text-primary",
                active && "bg-primary/15 text-primary border border-primary/20"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;