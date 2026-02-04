import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import { cn } from "../../utils/cn";

export default function Modal({ open, title, children, onClose, size = "md" }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onMouseDown={onClose}
    >
      <div
        className={cn(
          "w-full rounded-2xl border border-slate-800 bg-slate-950/80 shadow-soft backdrop-blur",
          widths[size]
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-800">
          <div>
            <p className="text-sm text-slate-400">Edit</p>
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          </div>
          <Button variant="ghost" onClick={onClose} className="px-3">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
