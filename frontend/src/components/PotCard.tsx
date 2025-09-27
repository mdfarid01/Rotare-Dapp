"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export type Pot = {
  id: string;
  name: string;
  apy: number;
  tvl: number;
  image: string;
};

export function PotCard({ pot, onDeposit, onBid }: { pot: Pot; onDeposit?: () => void; onBid?: () => void }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card className="overflow-hidden border-border/60 bg-white/5 backdrop-blur-lg">
        <CardHeader className="p-0">
          <div
            className="h-32 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${pot.image})` }}
          />
          <div className="p-4">
            <CardTitle className="flex items-center justify-between">
              <span>{pot.name}</span>
              <span className="text-sm text-muted-foreground">APY {pot.apy}%</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">TVL</div>
          <div className="text-2xl font-semibold">${pot.tvl.toLocaleString()}</div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button className="flex-1" onClick={onDeposit}>Deposit</Button>
          <Button className="flex-1" variant="secondary" onClick={onBid}>Bid</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default PotCard;