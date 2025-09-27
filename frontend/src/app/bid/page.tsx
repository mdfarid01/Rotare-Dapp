"use client";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import BidForm from "@/components/BidForm";
import { toast } from "sonner";

export default function BidPage() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <Topbar />
      <div className="grid grid-cols-[240px_1fr]">
        <Sidebar />
        <main className="px-6 py-6">
          <h1 className="text-2xl font-semibold">Place a Bid</h1>
          <p className="text-muted-foreground">Participate in dutch auctions to acquire pot shares.</p>
          <div className="mt-6 max-w-md">
            <BidForm onSubmit={(amount, asset) => toast.success(`Bid placed: ${amount} ${asset}`)} />
          </div>
        </main>
      </div>
    </div>
  );
}