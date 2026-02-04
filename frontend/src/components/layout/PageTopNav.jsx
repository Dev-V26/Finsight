import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BTN =
  "rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 hover:bg-slate-800 transition";

const BTN_ACTIVE =
  "rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 transition";

export default function PageTopNav({
  title,
  subtitle,
  backTo = "/dashboard",
  hideBack = false,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = useMemo(
    () => [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Transactions", path: "/transactions" },
      { label: "Budgets", path: "/budgets" },
      { label: "Goals", path: "/goals" },
      { label: "Portfolio", path: "/portfolio" },
      { label: "Settings", path: "/settings" },
    ],
    []
  );

  const isActive = (path) => pathname === path;

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-slate-400 mt-1">{subtitle}</p> : null}
      </div>

      {/* Right side actions (same placement as Portfolio page) */}
      <div className="flex flex-wrap justify-end gap-2">
        {!hideBack && (
          <button onClick={() => navigate(backTo)} className={BTN}>
            Back
          </button>
        )}

        {links.map((l) => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            className={isActive(l.path) ? BTN_ACTIVE : BTN}
            aria-current={isActive(l.path) ? "page" : undefined}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
