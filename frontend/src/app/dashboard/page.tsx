"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PotCard, { Pot } from "@/components/PotCard";
import ActivityLog, { Activity } from "@/components/ActivityLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const pots: Pot[] = [
  {
    id: "eth-yield",
    name: "ETH Yield Pot",
    apy: 8.2,
    tvl: 1250000,
    image:
      "https://images.unsplash.com/photo-1517341720290-426b3ea0be37?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "stable-vault",
    name: "Stable Vault",
    apy: 5.1,
    tvl: 860000,
    image:
      "https://images.unsplash.com/photo-1601972599720-b4a2e2b2edd3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "alt-auction",
    name: "Alt Auction Pool",
    apy: 11.4,
    tvl: 430000,
    image:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop",
  },
];

const activities: Activity[] = [
  { id: "1", type: "deposit", message: "Deposited 1,000 USDC into Stable Vault", time: "2h ago" },
  { id: "2", type: "bid", message: "Placed 2.5 ETH bid in Alt Auction Pool", time: "1d ago" },
  { id: "3", type: "create", message: "Created new pot 'ETH Yield Pot'", time: "3d ago" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] bg-gradient-to-br from-background via-background to-muted/20">
      <Topbar />
      <div className="grid grid-cols-[240px_1fr]">
        <Sidebar />
        <main className="relative px-6 py-6 space-y-6 overflow-hidden">
          {/* Subtle floating elements for minimal depth */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute top-20 right-20 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-40 left-40 w-48 h-48 bg-accent/10 rounded-full blur-2xl"></div>
          </div>
          <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold relative z-10">
            Overview
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-3 relative z-10">
            {pots.map((p) => (
              <PotCard key={p.id} pot={p} onDeposit={() => {}} onBid={() => {}} />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3 relative z-10">
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm md:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {[12, 18, 10, 22, 28, 16, 24, 30, 26, 20, 18, 32].map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="w-6 origin-bottom rounded bg-primary/40"
                      style={{ height: `${v * 3}px` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            <ActivityLog items={activities} />
          </div>

          <div className="grid gap-6 md:grid-cols-3 relative z-10">
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Total Liquidity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">$2,140,000</div>
                <div className="text-sm text-muted-foreground">Across all pots</div>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>My Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>Stable Vault — 12,500 USDC</li>
                  <li>ETH Yield Pot — 1.2 ETH</li>
                  <li>Alt Auction Pool — 3,200 USDT</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Next Auction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Starts in</div>
                <div className="text-2xl font-semibold">03:12:45</div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}