import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createHoldingApi,
  deleteHoldingApi,
  listHoldingsApi,
  updateHoldingApi,
} from "../../api/portfolio.api";
import AppPageHeader from "../../components/layout/AppPageHeader";

function fmtINR(n) {
  const x = Number(n || 0);
  return `₹${x.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function pct(n) {
  const x = Number(n || 0);
  return `${x.toFixed(2)}%`;
}

const emptyForm = {
  holdingType: "STOCK",
  allocation: "EQUITY",
  name: "",
  symbol: "",
  notes: "",
  buyPrice: 0,
  quantity: 1,
  currentValue: 0,
};

export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [holdings, setHoldings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    try {
      setLoading(true);
      const res = await listHoldingsApi();
      setHoldings(res.holdings || []);
    } catch (e) {
      toast.error(e?.normalizedMessage || e?.message || "Failed to load holdings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    let investedTotal = 0;
    let currentValueTotal = 0;
    const allocation = { EQUITY: 0, DEBT: 0, CRYPTO: 0, OTHER: 0 };

    for (const h of holdings) {
      const invested = Number(h.buyPrice || 0) * Number(h.quantity || 0);
      const current = Number(h.currentValue || 0);
      investedTotal += invested;
      currentValueTotal += current;

      const b = String(h.allocation || "OTHER").toUpperCase();
      if (allocation[b] === undefined) allocation.OTHER += current;
      else allocation[b] += current;
    }

    const profitLoss = currentValueTotal - investedTotal;
    const profitLossPct = investedTotal ? (profitLoss / investedTotal) * 100 : 0;

    return { investedTotal, currentValueTotal, profitLoss, profitLossPct, allocation };
  }, [holdings]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(h) {
    setEditingId(h._id);
    setForm({
      holdingType: h.holdingType,
      allocation: h.allocation,
      name: h.name || "",
      symbol: h.symbol || "",
      notes: h.notes || "",
      buyPrice: Number(h.buyPrice || 0),
      quantity: Number(h.quantity || 0),
      currentValue: Number(h.currentValue || 0),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);

      const payload = {
        ...form,
        holdingType: String(form.holdingType || "").toUpperCase(),
        allocation: String(form.allocation || "").toUpperCase(),
        buyPrice: Number(form.buyPrice || 0),
        quantity: Number(form.quantity || 0),
        currentValue: Number(form.currentValue || 0),
      };

      if (!payload.name.trim()) {
        toast.error("Name is required");
        return;
      }

      if (editingId) {
        await updateHoldingApi(editingId, payload);
        toast.success("Holding updated");
      } else {
        await createHoldingApi(payload);
        toast.success("Holding added");
      }

      resetForm();
      await load();
    } catch (e2) {
      toast.error(e2?.normalizedMessage || e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this holding?")) return;
    try {
      await deleteHoldingApi(id);
      toast.success("Deleted");
      await load();
    } catch (e) {
      toast.error(e?.normalizedMessage || e?.message || "Delete failed");
    }
  }

  const allocTotal = summary.currentValueTotal || 0;
  const allocRows = [
    { k: "EQUITY", label: "Equity" },
    { k: "DEBT", label: "Debt" },
    { k: "CRYPTO", label: "Crypto" },
    { k: "OTHER", label: "Other" },
  ].map((x) => {
    const v = Number(summary.allocation?.[x.k] || 0);
    const p = allocTotal ? (v / allocTotal) * 100 : 0;
    return { ...x, value: v, pct: p };
  });

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Investment Portfolio"
        subtitle="Track holdings (manual current value for now) and see profit/loss + allocation."
      />

      <div className="space-y-6">
        {/* Action row (keeps New Holding exactly available) */}
        <div className="flex justify-end">
          <button
            onClick={resetForm}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 hover:bg-slate-800"
          >
            New Holding
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-slate-400 text-sm">Invested</div>
            <div className="text-xl font-semibold mt-1">{fmtINR(summary.investedTotal)}</div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-slate-400 text-sm">Current Value</div>
            <div className="text-xl font-semibold mt-1">{fmtINR(summary.currentValueTotal)}</div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-slate-400 text-sm">Profit / Loss</div>
            <div className="text-xl font-semibold mt-1">{fmtINR(summary.profitLoss)}</div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-slate-400 text-sm">P/L %</div>
            <div className="text-xl font-semibold mt-1">{pct(summary.profitLossPct)}</div>
          </div>
        </div>

        {/* Allocation */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Asset Allocation</h2>
            <div className="text-slate-400 text-sm">Based on current value</div>
          </div>

          <div className="mt-4 space-y-3">
            {allocRows.map((r) => (
              <div key={r.k}>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-slate-300">
                    {r.label} <span className="text-slate-500">({pct(r.pct)})</span>
                  </div>
                  <div className="text-slate-300">{fmtINR(r.value)}</div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500/70"
                    style={{ width: `${Math.min(100, Math.max(0, r.pct))}%` }}
                  />
                </div>
              </div>
            ))}
            {!holdings.length && (
              <div className="text-slate-400 text-sm mt-2">
                No holdings yet — add your first holding to see allocation.
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit form */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <h2 className="text-lg font-semibold">{editingId ? "Edit Holding" : "Add Holding"}</h2>

          <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <div className="text-sm text-slate-400">Holding Type</div>
              <select
                value={form.holdingType}
                onChange={(e) => {
                  const holdingType = e.target.value;
                  const defaultAlloc =
                    holdingType === "CRYPTO"
                      ? "CRYPTO"
                      : holdingType === "STOCK"
                      ? "EQUITY"
                      : holdingType === "MUTUAL_FUND"
                      ? "EQUITY"
                      : "OTHER";

                  setForm((p) => ({ ...p, holdingType, allocation: defaultAlloc }));
                }}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              >
                <option value="STOCK">Stock</option>
                <option value="MUTUAL_FUND">Mutual Fund</option>
                <option value="CRYPTO">Crypto</option>
                <option value="MANUAL">Manual Asset</option>
              </select>
            </label>

            <label className="block">
              <div className="text-sm text-slate-400">Allocation Bucket</div>
              <select
                value={form.allocation}
                onChange={(e) => setForm((p) => ({ ...p, allocation: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
              >
                <option value="EQUITY">Equity</option>
                <option value="DEBT">Debt</option>
                <option value="CRYPTO">Crypto</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label className="block">
              <div className="text-sm text-slate-400">Name *</div>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                placeholder="e.g., TCS / HDFC Balanced Fund / Gold / Property"
              />
            </label>

            <label className="block">
              <div className="text-sm text-slate-400">Symbol (optional)</div>
              <input
                value={form.symbol}
                onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                placeholder="e.g., TCS / BTC"
              />
            </label>

            <label className="block">
              <div className="text-sm text-slate-400">Buy Price (per unit)</div>
              <input
                type="number"
                value={form.buyPrice}
                onChange={(e) => setForm((p) => ({ ...p, buyPrice: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                min="0"
                step="0.01"
              />
            </label>

            <label className="block">
              <div className="text-sm text-slate-400">Quantity</div>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                min="0"
                step="0.0001"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="text-sm text-slate-400">Current Value (total) *</div>
              <input
                type="number"
                value={form.currentValue}
                onChange={(e) => setForm((p) => ({ ...p, currentValue: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                min="0"
                step="0.01"
              />
            </label>

            <label className="block md:col-span-3">
              <div className="text-sm text-slate-400">Notes</div>
              <input
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
                placeholder="optional"
              />
            </label>

            <div className="md:col-span-3 flex gap-2">
              <button
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold hover:bg-emerald-500 disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update Holding" : "Add Holding"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-2 hover:bg-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Holdings table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Holdings</h2>
            <div className="text-slate-400 text-sm">{holdings.length} items</div>
          </div>

          {loading ? (
            <div className="text-slate-400 mt-3">Loading...</div>
          ) : holdings.length === 0 ? (
            <div className="text-slate-400 mt-3">
              No holdings yet. Add your first holding above.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="py-2">Name</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Alloc</th>
                    <th className="py-2">Invested</th>
                    <th className="py-2">Current</th>
                    <th className="py-2">P/L</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const invested = Number(h.buyPrice || 0) * Number(h.quantity || 0);
                    const current = Number(h.currentValue || 0);
                    const pl = current - invested;
                    const plPct = invested ? (pl / invested) * 100 : 0;

                    return (
                      <tr key={h._id} className="border-t border-slate-800">
                        <td className="py-3">
                          <div className="font-semibold">{h.name}</div>
                          {(h.symbol || h.notes) && (
                            <div className="text-slate-400 text-xs mt-1">
                              {h.symbol ? `${h.symbol}` : ""}
                              {h.symbol && h.notes ? " • " : ""}
                              {h.notes ? h.notes : ""}
                            </div>
                          )}
                        </td>
                        <td className="py-3">{h.holdingType}</td>
                        <td className="py-3">{h.allocation}</td>
                        <td className="py-3">{fmtINR(invested)}</td>
                        <td className="py-3">{fmtINR(current)}</td>
                        <td className="py-3">
                          <div className={pl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                            {fmtINR(pl)} <span className="text-slate-400">({pct(plPct)})</span>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(h)}
                              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete(h._id)}
                              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 hover:bg-slate-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
