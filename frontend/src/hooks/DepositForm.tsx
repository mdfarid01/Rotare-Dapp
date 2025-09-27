"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DepositForm({ onSubmit }: { onSubmit?: (amount: number, asset: string) => void }) {
  const [amount, setAmount] = useState(0);
  const [asset, setAsset] = useState("USDC");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(amount, asset);
      }}
      className="space-y-4 rounded-xl border border-border/60 bg-white/5 p-4 backdrop-blur"
    >
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label>Asset</Label>
        <Select value={asset} onValueChange={setAsset}>
          <SelectTrigger>
            <SelectValue placeholder="Select asset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USDC">USDC</SelectItem>
            <SelectItem value="DAI">DAI</SelectItem>
            <SelectItem value="ETH">ETH</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Deposit</Button>
    </form>
  );
}

export default DepositForm;