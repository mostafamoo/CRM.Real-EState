"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { label: string; primary: number; secondary: number };

export function OverviewAreaChart({ data }: { data: Point[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="h-72 w-full">
      {!mounted ? (
        <div className="h-full w-full rounded-lg bg-secondary/30 animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-primary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-secondary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--color-popover-foreground)",
              }}
            />
            <Area
              type="monotone"
              dataKey="primary"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="url(#grad-primary)"
            />
            <Area
              type="monotone"
              dataKey="secondary"
              stroke="var(--color-chart-3)"
              strokeWidth={2}
              fill="url(#grad-secondary)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
