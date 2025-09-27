"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Topbar from "@/components/Topbar";

export default function SigninPage() {
  return (
    <div className="min-h-screen">
      <Topbar />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-border/60 bg-white/5 p-6 backdrop-blur">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-muted-foreground">Sign in to continue to Chainpot.</p>
          <form className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@chainmail.xyz" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full" type="submit">Sign in</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            New here? <Link className="underline" href="/signup">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}