"use client";

import HomeHero from "@/components/HomeHero";
import Topbar from "@/components/Topbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Topbar />
      <HomeHero />
    </div>
  );
}