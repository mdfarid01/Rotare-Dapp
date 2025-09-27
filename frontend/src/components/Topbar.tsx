"use client";

import { WalletConnect } from "./WalletConnect";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-white/5 dark:bg-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-muted-foreground">Chainpot Liquidity Hub</span>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}

export default Topbar;