"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1550565118-3a14e8d03856?q=80&w=1200&auto=format&fit=crop)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft gradient blobs */}
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-500/25 via-fuchsia-400/20 to-cyan-400/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/20 via-cyan-400/20 to-blue-500/20 blur-3xl" />

        {/* Subtle grid to hint at on-chain ledgers */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <svg className="h-full w-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground/20" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating chips (tokens/pots) */}
        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, -6, 0], opacity: 1 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-8 top-24 rounded-full border border-border/60 bg-white/10 px-3 py-1 text-xs backdrop-blur"
        >
          🪙 ETH • 2.4% APY
        </motion.div>
        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 8, 0], opacity: 1 }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute right-10 top-40 rounded-full border border-border/60 bg-white/10 px-3 py-1 text-xs backdrop-blur"
        >
          💧 LP • USDC/ETH #742
        </motion.div>
        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, -10, 0], opacity: 1 }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full border border-border/60 bg-white/10 px-3 py-1 text-xs backdrop-blur"
        >
          🔗 Chainpot: Cycle 5 Live
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-balance bg-gradient-to-b from-primary to-foreground bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl"
        >
          Chainpot Liquidity Hub
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-4 max-w-2xl text-lg text-muted-foreground"
        >
          A decentralized gateway to pooled yield, auctions, and on-chain liquidity management. Deposit, bid, and create pots with transparent Web3 UX.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Button asChild>
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/signup">Create account</Link>
          </Button>
        </motion.div>
        <div className="pointer-events-none relative mt-16 rounded-3xl border border-border/60 bg-white/5 p-6 backdrop-blur">
          <div className="grid gap-6 sm:grid-cols-3">
            {["Pooled Yield", "Dutch Auctions", "Cross-Chain Ready"].map((f) => (
              <div key={f} className="rounded-xl border border-border/50 bg-white/5 p-4">
                <div className="text-sm text-muted-foreground">Feature</div>
                <div className="text-lg font-medium">{f}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;