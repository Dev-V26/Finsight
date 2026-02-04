import React from "react";
import { cn } from "../../utils/cn";

export default function Select({ className = "", children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-slate-600 focus:ring-2 focus:ring-indigo-500/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
