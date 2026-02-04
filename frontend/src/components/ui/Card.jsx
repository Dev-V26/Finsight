import React from "react";
import { cn } from "../../utils/cn";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/80 bg-slate-950/40 shadow-soft backdrop-blur",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={cn("px-6 py-5 border-b border-slate-800/80", className)}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}
