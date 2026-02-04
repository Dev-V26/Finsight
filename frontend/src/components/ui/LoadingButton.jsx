import React from "react";

export default function LoadingButton({
  children,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        "relative inline-flex items-center justify-center gap-2",
        "rounded-xl px-4 py-2 font-medium",
        "transition",
        isDisabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-95",
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </button>
  );
}
