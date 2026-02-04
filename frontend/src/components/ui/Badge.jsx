import React from "react";
import { cn } from "../../utils/cn";

const VARIANTS = {
  neutral: "bg-slate-900/70 text-slate-200 border-slate-800",
  success: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-200 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-200 border-rose-500/20",
  info: "bg-indigo-500/10 text-indigo-200 border-indigo-500/20",
};

export default function Badge({ variant = "neutral", className = "", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
