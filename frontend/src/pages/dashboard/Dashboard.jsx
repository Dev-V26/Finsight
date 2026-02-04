import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import LoadingButton from "../../components/ui/LoadingButton";

function formatINR(n) {
  const num = Number(n || 0);
  // simple formatter; you can replace later with Settings currency
  return `₹${num.toLocaleString("en-IN")}`;
}

function yyyymmNow() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}`;
}

function getMonthLabel(yyyymm) {
  const [y, m] = String(yyyymm).split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [month, setMonth] = useState(yyyymmNow());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthLabel = useMemo(() => getMonthLabel(month), [month]);

  async function fetchInsights(selectedMonth = month) {
    setLoading(true);
    try {
      const { data } = await api.get(`/insights/dashboard?month=${encodeURIComponent(selectedMonth)}`);
      setData(data);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInsights(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const summary = data?.summary || { income: 0, expense: 0, netSavings: 0 };
  const charts = data?.charts || { incomeVsExpense: [], expenseByCategory: [] };
  const unusualActivity = data?.unusualActivity || [];
  const budgetAlerts = data?.budgetAlerts || [];
  const goalsProgress = data?.goalsProgress || [];
  const recentTransactions = data?.recentTransactions || [];
  const portfolio = data?.portfolio || { count: 0, holdings: [] };

  return (
    <div className="min-h-screen p-6 text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Welcome, {user?.name || "User"} ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LoadingButton
              loading={loading}
              onClick={() => fetchInsights(month)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 text-sm"
            >
              Refresh
            </LoadingButton>

            <button
              onClick={logout}
              className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-sm text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Month Picker + helper */}
        <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-xs">
              <label className="text-sm text-slate-300">Month</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-slate-600"
              />
              <p className="text-xs text-slate-500 mt-2">
                Insights are calculated for selected month.
              </p>
            </div>

            <div className="text-sm text-slate-400">
              Selected: <span className="text-slate-200">{monthLabel}</span>
            </div>
          </div>
        </div>

        {/* Unusual Activity (Warning Card) */}
        {unusualActivity.length > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-amber-200 font-semibold text-lg">⚠️ Unusual Activity</div>
                <div className="text-amber-100/70 text-sm mt-1">
                  We noticed activity that looks different from your normal spending.
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30">
                {unusualActivity.length} alert{unusualActivity.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {unusualActivity.map((a) => (
                <div
                  key={a._id}
                  className="rounded-xl border border-amber-500/20 bg-slate-950/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-slate-100 font-medium">{a.title || "Unusual Activity"}</div>
                      <div className="text-slate-300/80 text-sm mt-1">
                        {a.message || "Something looks unusual."}
                      </div>
                      <div className="text-slate-400 text-xs mt-2">
                        Severity: <span className="text-slate-200">{a.severity || "MEDIUM"}</span>{" "}
                        • {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
            <div className="text-slate-400 text-sm">Income</div>
            <div className="text-2xl font-semibold mt-2">{formatINR(summary.income)}</div>
            <div className="text-xs text-slate-500 mt-1">This month</div>
          </div>

          <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
            <div className="text-slate-400 text-sm">Expense</div>
            <div className="text-2xl font-semibold mt-2">{formatINR(summary.expense)}</div>
            <div className="text-xs text-slate-500 mt-1">This month</div>
          </div>

          <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
            <div className="text-slate-400 text-sm">Net Savings</div>
            <div className="text-2xl font-semibold mt-2">{formatINR(summary.netSavings)}</div>
            <div className="text-xs text-slate-500 mt-1">Income − Expense</div>
          </div>
        </div>

        {/* Middle section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Income vs Expense (daily) */}
          <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Income vs Expense</h2>
              <span className="text-xs text-slate-500">{month}</span>
            </div>

            {charts.incomeVsExpense?.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="text-left py-2">Date</th>
                      <th className="text-right py-2">Income</th>
                      <th className="text-right py-2">Expense</th>
                    </tr>
                  </thead>
                  <tbody>
                    {charts.incomeVsExpense.slice(-10).map((r) => (
                      <tr key={r.date} className="border-t border-slate-800">
                        <td className="py-2 text-slate-200">{r.date}</td>
                        <td className="py-2 text-right text-slate-200">{formatINR(r.income)}</td>
                        <td className="py-2 text-right text-slate-200">{formatINR(r.expense)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-xs text-slate-500 mt-2">
                  Showing last 10 days with activity.
                </div>
              </div>
            ) : (
              <div className="mt-6 text-slate-500 text-sm">
                No income/expense data available for this month.
              </div>
            )}
          </div>

          {/* Expense by Category */}
          <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Expense by Category</h2>
              <span className="text-xs text-slate-500">{month}</span>
            </div>

            {charts.expenseByCategory?.length ? (
              <div className="mt-4 space-y-2">
                {charts.expenseByCategory.slice(0, 8).map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
                  >
                    <div className="text-slate-200">{c.category}</div>
                    <div className="text-slate-200 font-medium">{formatINR(c.amount)}</div>
                  </div>
                ))}
                {charts.expenseByCategory.length > 8 && (
                  <div className="text-xs text-slate-500 pt-1">
                    +{charts.expenseByCategory.length - 8} more categories…
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 text-slate-500 text-sm">
                No expense category data for this month.
              </div>
            )}
          </div>
        </div>

        {/* Portfolio */}
        <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Portfolio</h2>
              <p className="text-slate-400 text-sm mt-1">
                {portfolio.count ? `${portfolio.count} holding(s)` : "No holdings yet"}
              </p>
            </div>

            <button
              onClick={() => (window.location.href = "/portfolio")}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 text-sm"
            >
              Manage
            </button>
          </div>

          {portfolio.holdings?.length ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {portfolio.holdings.map((h) => (
                <div
                  key={h._id}
                  className="rounded-xl border border-slate-800 bg-slate-900/30 p-4"
                >
                  <div className="text-slate-100 font-medium">{h.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{h.assetType}</div>
                  <div className="text-sm text-slate-200 mt-3">
                    Qty: <span className="text-slate-100">{h.quantity}</span>
                  </div>
                  <div className="text-sm text-slate-200">
                    Buy: <span className="text-slate-100">{formatINR(h.buyPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-slate-500 text-sm">
              Add holdings to view portfolio snapshot.
            </div>
          )}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Budget Alerts */}
          <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
            <h2 className="font-semibold">Budget Alerts</h2>

            {budgetAlerts.length ? (
              <div className="mt-4 space-y-3">
                {budgetAlerts.map((b) => (
                  <div
                    key={b._id}
                    className="rounded-xl border border-slate-800 bg-slate-900/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-slate-100 font-medium">{b.category}</div>
                      <span
                        className={`text-xs px-2 py-1 rounded-lg border ${
                          b.status === "over"
                            ? "text-red-200 bg-red-500/10 border-red-500/30"
                            : "text-amber-200 bg-amber-500/10 border-amber-500/30"
                        }`}
                      >
                        {b.status === "over" ? "Over budget" : "Near limit"}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-slate-300">
                      Spent: <span className="text-slate-100">{formatINR(b.spent)}</span> /{" "}
                      {formatINR(b.limit)}
                    </div>

                    <div className="mt-3 h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-slate-200/70"
                        style={{ width: `${Math.min(100, Number(b.percent || 0))}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{b.percent}% used</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-slate-500 text-sm">No alerts 🎉</div>
            )}
          </div>

          {/* Goals Progress */}
          <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
            <h2 className="font-semibold">Goals Progress</h2>

            {goalsProgress.length ? (
              <div className="mt-4 space-y-3">
                {goalsProgress.slice(0, 4).map((g) => (
                  <div
                    key={g._id}
                    className="rounded-xl border border-slate-800 bg-slate-900/30 p-4"
                  >
                    <div className="text-slate-100 font-medium">{g.title}</div>
                    <div className="text-sm text-slate-300 mt-1">
                      {formatINR(g.currentAmount)} / {formatINR(g.targetAmount)}
                    </div>

                    <div className="mt-3 h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-slate-200/70"
                        style={{ width: `${Math.min(100, Number(g.percent || 0))}%` }}
                      />
                    </div>

                    <div className="text-xs text-slate-500 mt-2">{g.percent}% complete</div>
                  </div>
                ))}
                {goalsProgress.length > 4 && (
                  <div className="text-xs text-slate-500">+{goalsProgress.length - 4} more goals…</div>
                )}
              </div>
            ) : (
              <div className="mt-4 text-slate-500 text-sm">No goals yet.</div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-5">
            <h2 className="font-semibold">Recent Transactions</h2>

            {recentTransactions.length ? (
              <div className="mt-4 space-y-2">
                {recentTransactions.map((t) => {
                  const isExpense = t.type === "expense";
                  return (
                    <div
                      key={t._id}
                      className="rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-slate-100 font-medium">{t.category || "Other"}</div>
                        <div className="text-xs text-slate-500">
                          {t.date ? new Date(t.date).toLocaleDateString() : ""}
                          {t.note ? ` • ${t.note}` : ""}
                        </div>
                      </div>

                      <div className={`font-semibold ${isExpense ? "text-rose-300" : "text-emerald-300"}`}>
                        {isExpense ? "-" : "+"}
                        {formatINR(t.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 text-slate-500 text-sm">No transactions yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
