"use client";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreatePotPage() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <Topbar />
      <div className="grid grid-cols-[240px_1fr]">
        <Sidebar />
        <main className="px-6 py-6">
          <h1 className="text-2xl font-semibold">Create a Pot</h1>
          <p className="text-muted-foreground">Define parameters for a new liquidity pot.</p>
          <form
            className="mt-6 max-w-lg space-y-4 rounded-2xl border border-border/60 bg-white/5 p-6 backdrop-blur"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Pot created (mock)");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Pot Name</Label>
              <Input id="name" placeholder="e.g. ETH Yield Pot" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="apy">Target APY (%)</Label>
                <Input id="apy" type="number" placeholder="8" />
              </div>
              <div className="space-y-2">
                <Label>Base Asset</Label>
                <Select defaultValue="USDC">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="DAI">DAI</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min">Min Deposit</Label>
                <Input id="min" type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cap">Capacity</Label>
                <Input id="cap" type="number" placeholder="100000" />
              </div>
            </div>
            <Button type="submit" className="w-full">Create Pot</Button>
          </form>
        </main>
      </div>
    </div>
  );
}