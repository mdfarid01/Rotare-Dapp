import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google'
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Chainpot Liquidity Hub",
  description: "Web3 interface for pooled yield, auctions, and on-chain liquidity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}