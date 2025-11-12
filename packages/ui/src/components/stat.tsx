'use client';

import * as React from "react";
import { cn } from "../lib/cn";

export interface StatProps {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  trend?: {
    label: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}

const trendColors: Record<NonNullable<StatProps["trend"]>["direction"], string> = {
  up: "text-emerald-600",
  down: "text-rose-600",
  neutral: "text-muted-foreground"
};

export const StatCard: React.FC<StatProps> = ({ label, value, description, trend, className }) => {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        {description ? <span>{description}</span> : <span>&nbsp;</span>}
        {trend ? (
          <span className={cn("flex items-center gap-1 font-medium", trendColors[trend.direction])}>
            {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "◆"} {trend.label}
          </span>
        ) : null}
      </div>
    </div>
  );
};
