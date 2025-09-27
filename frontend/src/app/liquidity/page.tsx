"use client";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LiquidityPage() {
  const pools = [
    { id: "eth", name: "ETH Yield Pot", tvl: 1250000, utilization: 72, apy: 8.2 },
    { id: "stable", name: "Stable Vault", tvl: 860000, utilization: 41, apy: 5.1 },
    { id: "alt", name: "Alt Auction Pool", tvl: 430000, utilization: 58, apy: 11.4 },
  ];

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <Topbar />
      <div className="grid grid-cols-[240px_1fr]">
        <Sidebar />
        <main className="px-6 py-6 space-y-6">
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold">
            Liquidity Overview
          </motion.h1>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/60 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle>Total TVL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">$2,140,000</div>
                <div className="text-sm text-muted-foreground">Across all pools</div>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle>24h Net Flows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-emerald-400">+$84,200</div>
                <div className="text-sm text-muted-foreground">Deposits - Withdrawals</div>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle>Average APY</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">8.2%</div>
                <div className="text-sm text-muted-foreground">Weighted across pools</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool</TableHead>
                    <TableHead className="text-right">TVL</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                    <TableHead className="text-right">APY</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pools.map((p, i) => (
                    <TableRow key={p.id} className="align-middle">
                      <TableCell>
                        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                          {p.name}
                        </motion.div>
                      </TableCell>
                      <TableCell className="text-right">${p.tvl.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-3">
                          <div className="w-40">
                            <Progress value={p.utilization} />
                          </div>
                          <span className="text-sm text-muted-foreground">{p.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{p.apy}%</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="secondary">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}