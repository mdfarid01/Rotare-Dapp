"use client";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import DepositForm from "@/components/DepositForm";

export default function DepositPage() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <Topbar />
      <div className="grid grid-cols-[240px_1fr]">
        <Sidebar />
        <main className="px-6 py-6">
          <h1 className="text-2xl font-semibold">Deposit</h1>
          <p className="text-muted-foreground">Add funds into any liquidity pot.</p>
          <div className="mt-6 max-w-md">
            <DepositForm onSubmit={(amount, asset) => alert(`Deposited ${amount} ${asset}`)} />
          </div>
        </main>
      </div>
    </div>
  );
}