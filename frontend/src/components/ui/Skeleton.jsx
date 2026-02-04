import React from "react";
import { cn } from "../../utils/cn";

export function Skeleton({ className = "" }) {
  return <div className={cn("animate-pulse rounded-xl bg-slate-800/40", className)} />;
}
