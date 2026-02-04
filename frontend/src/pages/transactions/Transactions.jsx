// frontend/src/pages/transactions/Transactions.jsx
import { useEffect, useMemo, useState } from "react";
import {
  createTransactionApi,
  deleteTransactionApi,
  listTransactionsApi,
  updateTransactionApi,
} from "../../api/transaction.api";
import AppPageHeader from "../../components/layout/AppPageHeader";

const CATEGORY_OPTIONS = ["Food", "Rent", "Travel", "Shopping", "Bills", "Salary", "Other"];

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    from: "",
    to: "",
  });

  // Create form
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    paymentMethod: "upi",
    notes: "",
  });

  // Edit modal state
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    type: "expense",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "upi",
    notes: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await listTransactionsApi(filters);
      const arr = Array.isArray(res?.data) ? res.data : res?.data?.items || [];
      setItems(arr);
    } catch (e) {
      console.error(e);
      setError("Failed to load transactions");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.from, filters.to]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of items) {
      const amt = Number(t.amount || 0);
      const type = String(t.type || "").toLowerCase();
      if (type === "income") income += amt;
      else expense += amt;
    }
    return { income, expense, net: income - expense };
  }, [items]);

  async function onCreate(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const amt = Number(form.amount);
      if (!Number.isFinite(amt) || amt <= 0) throw new Error("Enter a valid amount");

      await createTransactionApi({
        ...form,
        amount: amt,
        date: new Date(form.date).toISOString(),
      });

      setForm((p) => ({
        ...p,
        amount: "",
        notes: "",
      }));

      await load();
    } catch (e) {
      setError(e?.message || "Failed to add transaction");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this transaction?")) return;
    setBusy(true);
    setError("");
    try {
      await deleteTransactionApi(id);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to delete transaction");
    } finally {
      setBusy(false);
    }
  }

  function openEdit(t) {
    setEditing(t);
    setEditForm({
      type: String(t.type || "expense").toLowerCase(),
      amount: String(t.amount ?? ""),
      category: t.category || "Food",
      date: t.date ? String(t.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      paymentMethod: t.paymentMethod || "upi",
      notes: t.notes || "",
    });
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");

    try {
      const amt = Number(editForm.amount);
      if (!Number.isFinite(amt) || amt <= 0) throw new Error("Enter a valid amount");

      await updateTransactionApi(editing._id, {
        ...editForm,
        amount: amt,
        date: new Date(editForm.date).toISOString(),
      });

      setEditing(null);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to update transaction");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <AppPageHeader title="Transactions" subtitle="Add and track income/expenses" />

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Income (Loaded)" value={totals.income} />
          <StatCard title="Expense (Loaded)" value={totals.expense} />
          <StatCard title="Net (Loaded)" value={totals.net} />
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Type">
              <select
                value={filters.type}
                onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </Field>

            <Field label="From">
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </Field>

            <Field label="To">
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </Field>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setFilters({ type: "", from: "", to: "" })}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 hover:bg-slate-800"
            >
              Clear
            </button>

            <button
              onClick={load}
              disabled={busy || loading}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </div>

        {/* Create Transaction */}
        <form
          onSubmit={onCreate}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <h2 className="text-lg font-semibold">Add Transaction</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </Field>

            <Field label="Amount">
              <input
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="e.g., 500"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                required
              />
            </Field>

            <Field label="Category">
              <input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g., Food, Rent, Custom Name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                required
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </Field>

            <Field label="Payment Method">
              <input
                value={form.paymentMethod}
                onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="upi / cash / card"
              />
            </Field>

            <Field label="Notes">
              <input
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="optional"
              />
            </Field>
          </div>

          <button
            disabled={busy}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-60"
          >
            {busy ? "Saving..." : "Add"}
          </button>
        </form>

        {/* List */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Transactions</h2>
            <span className="text-sm text-slate-400">{items.length} items</span>
          </div>

          {loading ? (
            <div className="p-6 text-slate-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-slate-400">No transactions yet.</div>
          ) : (
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) => (
                    <tr key={t._id} className="border-b border-slate-800/60">
                      <td className="py-3">{t.date ? String(t.date).slice(0, 10) : "-"}</td>
                      <td className="py-3 capitalize">{String(t.type || "").toLowerCase()}</td>
                      <td className="py-3">{t.category || "-"}</td>
                      <td className="py-3 text-right">{formatINR(t.amount)}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(t)}
                            className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-950"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(t._id)}
                            className="rounded-lg border border-rose-700 bg-rose-950/30 px-3 py-1 text-rose-200 hover:bg-rose-900/40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {editing ? (
          <Modal title="Edit Transaction" onClose={() => setEditing(null)}>
            <form onSubmit={onUpdate} className="grid gap-4">
              <Field label="Type">
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </Field>

              <Field label="Amount">
                <input
                  value={editForm.amount}
                  onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </Field>

              <Field label="Category">
                <input
                  value={editForm.category}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g., Food, Rent, Custom Name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                  required
                />
              </Field>

              <Field label="Date">
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </Field>

              <Field label="Payment Method">
                <input
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </Field>

              <Field label="Notes">
                <input
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </Field>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-60"
                  disabled={busy}
                >
                  {busy ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </Modal>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-2xl font-semibold mt-2">{formatINR(value)}</p>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-950"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function formatINR(n) {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num);
}
