import React from "react";
import { cn } from "../../utils/cn";

export default function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-8 text-center",
        className
      )}
    >
      <p className="text-base font-semibold text-slate-100">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
