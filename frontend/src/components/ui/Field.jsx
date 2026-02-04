import React from "react";

export default function Field({ label, hint, children }) {
  return (
    <div>
      {label ? (
        <div className="flex items-end justify-between">
          <label className="text-sm font-medium text-slate-200">{label}</label>
          {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
        </div>
      ) : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}
