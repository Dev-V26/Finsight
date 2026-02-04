import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";
import AppPageHeader from "../../components/layout/AppPageHeader";

/* ----------------------------- helpers ----------------------------- */
function getId(x) {
  return x?._id || x?.id;
}

function normalizeList(resData) {
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.items)) return resData.items;
  if (Array.isArray(resData?.data)) return resData.data;
  return [];
}

function pct(curr, target) {
  const c = Number(curr || 0);
  const t = Number(target || 0);
  if (t <= 0) return 0;
  return Math.min(100, (c / t) * 100);
}

/* ----------------------------- GoalForm ---------------------------- */
function GoalForm({ mode = "create", initialData, onCancel, onSuccess }) {
  const isEdit = mode === "edit";
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [targetAmount, setTargetAmount] = useState(
    initialData?.targetAmount != null ? String(initialData.targetAmount) : ""
  );
  const [currentAmount, setCurrentAmount] = useState(
    initialData?.currentAmount != null ? String(initialData.currentAmount) : ""
  );
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? String(initialData.deadline).slice(0, 10) : ""
  );

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);

      if (!title.trim()) {
        toast.error("Goal title is required");
        return;
      }
      const t = Number(targetAmount);
      const c = Number(currentAmount || 0);
      if (!Number.isFinite(t) || t <= 0) {
        toast.error("Target amount must be greater than 0");
        return;
      }
      if (!Number.isFinite(c) || c < 0) {
        toast.error("Current amount must be 0 or more");
        return;
      }

      const payload = {
        title: title.trim(),
        targetAmount: t,
        currentAmount: c,
        deadline: deadline || "",
        status: c >= t ? "completed" : "active",
      };

      if (isEdit) {
        const id = getId(initialData);

        // ✅ FIX: backend expects PATCH, not PUT
        await api.patch(`/goals/${id}`, payload);

        toast.success("Goal updated");
      } else {
        await api.post("/goals", payload);
        toast.success("Goal created");
      }

      onSuccess?.();
    } catch (e2) {
      toast.error(e2?.normalizedMessage || e2?.message || "Failed to save goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-100">
          {isEdit ? "Edit Goal" : "Create Goal"}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <div>
          <label className="text-sm text-slate-300">Goal Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            placeholder="e.g., Buy a new laptop"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm text-slate-300">Target Amount *</label>
            <input
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              disabled={saving}
              placeholder="e.g., 50000"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Current Saved</label>
            <input
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              disabled={saving}
              placeholder="e.g., 10000"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={saving}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Goal"}
        </button>
      </form>
    </div>
  );
}

/* ----------------------------- page ----------------------------- */
export default function Goals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Add Amount UI state
  const [openAddId, setOpenAddId] = useState(null);
  const [addAmount, setAddAmount] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/goals");
      setItems(normalizeList(res?.data));
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed to load goals");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const totalTarget = useMemo(
    () => items.reduce((sum, g) => sum + Number(g.targetAmount || 0), 0),
    [items]
  );
  const totalSaved = useMemo(
    () => items.reduce((sum, g) => sum + Number(g.currentAmount || 0), 0),
    [items]
  );

  const onAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const onEdit = (g) => {
    setEditItem(g);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (g) => {
    try {
      const id = getId(g);
      if (!confirm("Delete this goal?")) return;
      await api.delete(`/goals/${id}`);
      toast.success("Goal deleted");
      await fetchGoals();
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed to delete goal");
    }
  };

  const openAddAmount = (g) => {
    const id = getId(g);
    setOpenAddId(id);
    setAddAmount("");
  };

  const closeAddAmount = () => {
    setOpenAddId(null);
    setAddAmount("");
  };

  const saveAddAmount = async (g) => {
    const id = getId(g);
    const inc = Number(addAmount);
    if (!Number.isFinite(inc) || inc <= 0) {
      toast.error("Enter a valid amount (> 0)");
      return;
    }

    const current = Number(g.currentAmount || 0);
    const target = Number(g.targetAmount || 0);
    const next = Math.max(0, current + inc);

    try {
      setSavingAdd(true);

      // ✅ FIX: backend expects PATCH, not PUT
      await api.patch(`/goals/${id}`, {
        currentAmount: next,
        status: target > 0 && next >= target ? "completed" : "active",
      });

      toast.success("Amount added");
      closeAddAmount();
      await fetchGoals();
    } catch (e) {
      toast.error(e?.normalizedMessage || e?.message || "Failed to add amount");
    } finally {
      setSavingAdd(false);
    }
  };

  return (
    <div className="space-y-6">
      <AppPageHeader title="Goals" subtitle="Track your savings goals and progress." />

      <div className="space-y-6">
        {/* Actions row */}
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={fetchGoals}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition"
          >
            Refresh
          </button>

          <button
            onClick={onAdd}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 transition"
          >
            + Create Goal
          </button>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Target</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">₹{totalTarget.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Saved</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">₹{totalSaved.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Overall Progress</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">
              {totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}%` : "0%"}
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mt-6">
            <GoalForm
              mode={editItem ? "edit" : "create"}
              initialData={editItem}
              onCancel={() => {
                setShowForm(false);
                setEditItem(null);
              }}
              onSuccess={async () => {
                setShowForm(false);
                setEditItem(null);
                await fetchGoals();
              }}
            />
          </div>
        )}

        {/* History Cards */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Goals History</h2>
            <span className="text-sm text-slate-400">{items.length} items</span>
          </div>

          {loading ? (
            <div className="p-6 text-slate-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-slate-400">No goals yet.</div>
          ) : (
            <div className="p-5 grid gap-4">
              {items
                .slice()
                .sort(
                  (a, b) =>
                    pct(b.currentAmount, b.targetAmount) - pct(a.currentAmount, a.targetAmount)
                )
                .map((g) => {
                  const id = getId(g);
                  const progress = pct(g.currentAmount, g.targetAmount);
                  const remaining = Math.max(
                    0,
                    Number(g.targetAmount || 0) - Number(g.currentAmount || 0)
                  );
                  const deadline = g.deadline ? new Date(g.deadline).toLocaleDateString() : null;
                  const isOpen = openAddId === id;

                  return (
                    <div key={id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-100">
                              {g.title || "Untitled Goal"}
                            </h3>
                            <span className="text-xs rounded-lg border border-slate-700 px-2 py-1 text-slate-300">
                              {progress >= 100 || g.status === "completed" ? "Completed" : "Active"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Saved: ₹{Number(g.currentAmount || 0).toFixed(2)} / ₹
                            {Number(g.targetAmount || 0).toFixed(2)}
                            {deadline ? ` • Deadline: ${deadline}` : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {!isOpen ? (
                            <button
                              onClick={() => openAddAmount(g)}
                              className="rounded-lg border border-emerald-700 bg-emerald-950/30 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-900/40 transition"
                            >
                              + Add Amount
                            </button>
                          ) : (
                            <button
                              onClick={closeAddAmount}
                              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 transition"
                            >
                              Close
                            </button>
                          )}

                          <button
                            onClick={() => onEdit(g)}
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(g)}
                            className="rounded-lg border border-rose-700 bg-rose-950/30 px-3 py-1.5 text-sm text-rose-200 hover:bg-rose-900/40 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Add Amount panel */}
                      {isOpen && (
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                          <p className="text-sm font-semibold text-slate-100">
                            Add amount to this goal
                          </p>

                          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                            <input
                              value={addAmount}
                              onChange={(e) => setAddAmount(e.target.value)}
                              disabled={savingAdd}
                              placeholder="e.g., 2000"
                              className="w-full md:max-w-[220px] rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none focus:border-emerald-500"
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={() => saveAddAmount(g)}
                                disabled={savingAdd}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                              >
                                {savingAdd ? "Saving..." : "Save"}
                              </button>

                              <button
                                onClick={closeAddAmount}
                                disabled={savingAdd}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{Math.round(progress)}%</span>
                          <span>Remaining: ₹{remaining.toFixed(2)}</span>
                        </div>

                        <div className="mt-2 h-3 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
