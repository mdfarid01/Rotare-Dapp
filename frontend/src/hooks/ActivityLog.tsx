"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Activity = { id: string; type: "deposit" | "bid" | "create"; message: string; time: string };

export function ActivityLog({ items }: { items: Activity[] }) {
  return (
    <Card className="border-border/60 bg-white/5 backdrop-blur">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-4">
              <div className="text-sm">
                <div className="font-medium capitalize">{a.type}</div>
                <div className="text-muted-foreground">{a.message}</div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default ActivityLog;