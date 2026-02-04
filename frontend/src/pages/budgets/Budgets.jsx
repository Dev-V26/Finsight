import { useEffect, useMemo, useState } from "react";
import { listBudgetsApi, saveBudgetApi } from "../../api/budget.api";
import AppPageHeader from "../../components/layout/AppPageHeader";

const CATEGORIES = ["Food", "Rent", "Travel", "Shopping", "Bills", "Other"];

export default function Budgets() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ exceededCount: 0 });
  const [form, setForm] = useState({ category: "Food", amount: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const monthLabel = useMemo(() => {
    const [y, m] = month.split("-");
    const dt = new Date(Number(y), Number(m) - 1, 1);
    return dt.toLocaleString("en", { month: "long", year: "numeric" });
  }, [month]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await listBudgetsApi(month);
      // API shape: { success, message, data: { month, exceededCount, items: [...] } }
      const arr = Array.isArray(res?.data?.items) ? res.data.items : [];
      setItems(arr);
      setMeta({ exceededCount: res?.data?.exceededCount || 0 });
    } catch (e) {
      console.error(e);
      setError("Failed to load budgets. Please try again.");
      setItems([]);
      setMeta({ exceededCount: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function onSave(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const amt = Number(form.amount);
      if (!form.category) throw new Error("Category required");
      if (!Number.isFinite(amt) || amt <= 0) throw new Error("Enter a valid amount");

      await saveBudgetApi({
        category: form.category,
        amount: amt,
        month,
      });

      setForm({ category: form.category, amount: "" });
      await load();
    } catch (err) {
      setError(err?.message || "Failed to save budget.");
    } finally {
      setBusy(false);
    }
  }

  function pct(used, total) {
    const u = Number(used) || 0;
    const t = Number(total) || 0;
    if (t <= 0) return 0;
    return Math.min((u / t) * 100, 100);
  }

  function inr(n) {
    const num = Number(n) || 0;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num);
  }

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Budgets"
        subtitle={`Set category budgets for ${monthLabel}`}
      />

      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <label className="text-sm text-slate-300">Month</label>
            <div>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="mt-2 bg-slate-900 border border-slate-700 p-2 rounded-xl"
              />
            </div>
          </div>

          {meta.exceededCount > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
              ⚠️ {meta.exceededCount} budget(s) exceeded this month.
            </div>
          )}
        </div>

        {/* Save Budget */}
        <form
          onSubmit={onSave}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <h2 className="font-semibold">Set / Update a Budget</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-sm text-slate-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-700 p-2 rounded-xl"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Amount</label>
              <input
                placeholder="e.g., 5000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="mt-2 w-full bg-slate-950 border border-slate-700 p-2 rounded-xl"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                disabled={busy}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-medium disabled:opacity-60"
              >
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </form>

        {/* Budgets List */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your Budgets</h2>
            <button
              onClick={load}
              className="rounded-xl border border-slate-700 px-4 py-2 hover:bg-slate-900"
              disabled={loading || busy}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="mt-4 text-slate-400">Loading...</p>
          ) : items.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-300 font-medium">No budgets yet.</p>
              <p className="text-slate-400 text-sm mt-1">
                Set your first budget above (example: Food = 3000).
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {items.map((b) => (
                <div
                  key={b._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{b.category}</p>
                      <p className="text-slate-400 text-sm">
                        Used {inr(b.used)} out of {inr(b.amount)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-300">
                        Remaining:{" "}
                        <span className={b.exceeded ? "text-red-300" : "text-slate-100"}>
                          {inr(b.remaining)}
                        </span>
                      </p>
                      {b.exceeded && <p className="text-red-300 text-sm mt-1">Budget exceeded</p>}
                    </div>
                  </div>

                  <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={b.exceeded ? "h-2 bg-red-500" : "h-2 bg-green-500"}
                      style={{ width: `${pct(b.used, b.amount)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
