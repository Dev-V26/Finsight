import React from "react";
import { cn } from "../../utils/cn";

export function Label({ className = "", children, ...props }) {
  return (
    <label className={cn("text-xs font-medium text-slate-300", className)} {...props}>
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-indigo-500/20",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
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

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-600 focus:ring-2 focus:ring-indigo-500/20",
        className
      )}
      {...props}
    />
  );
}
