import React, { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ArrowLeft,
  Wallet,
  Target,
  PieChart,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
} from "lucide-react";

import NotificationBell from "../NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: Wallet },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function routeTitle(pathname) {
  const hit = navItems.find((n) => n.to === pathname);
  return hit?.label || "FinSight";
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = useMemo(() => {
    const n = String(user?.name || "U").trim();
    return n
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U";
  }, [user?.name]);

  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen border-r border-slate-800/80 bg-slate-950/40 backdrop-blur">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-indigo-200" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Personal Finance</p>
              <p className="text-lg font-semibold text-slate-100 leading-tight">FinSight</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-semibold text-slate-100">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      isActive
                        ? "bg-indigo-500/10 text-indigo-200 border border-indigo-500/20"
                        : "text-slate-300 hover:bg-slate-900/50 hover:text-slate-100"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Button
            variant="secondary"
            className="w-full justify-center"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0">
        <div className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/35 backdrop-blur">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
              <p className="text-base font-semibold text-slate-100">{routeTitle(pathname)}</p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              {/* <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> */}
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
