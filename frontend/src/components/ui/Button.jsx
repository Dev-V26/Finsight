import React from "react";
import { cn } from "../../utils/cn";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed";

const VARIANTS = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500",
  secondary:
    "bg-slate-900 text-slate-100 border border-slate-800 hover:bg-slate-800",
  ghost: "bg-transparent text-slate-200 hover:bg-slate-900/60",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-2.5 text-sm rounded-xl",
};

export default function Button({
  variant = "secondary",
  size = "md",
  className = "",
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}
