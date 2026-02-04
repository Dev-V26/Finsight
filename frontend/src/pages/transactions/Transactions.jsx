// // frontend/src/pages/transactions/Transactions.jsx
// import { useEffect, useMemo, useState } from "react";
// import {
//   createTransactionApi,
//   deleteTransactionApi,
//   listTransactionsApi,
//   updateTransactionApi,
// } from "../../api/transaction.api";
// import AppPageHeader from "../../components/layout/AppPageHeader";

// const CATEGORY_OPTIONS = ["Food", "Rent", "Travel", "Shopping", "Bills", "Salary", "Other"];

// export default function Transactions() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState("");

//   // Filters
//   const [filters, setFilters] = useState({
//     type: "",
//     from: "",
//     to: "",
//   });

//   // Create form
//   const [form, setForm] = useState({
//     type: "expense",
//     amount: "",
//     category: "Food",
//     date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
//     paymentMethod: "upi",
//     notes: "",
//   });

//   // Edit modal state
//   const [editing, setEditing] = useState(null);
//   const [editForm, setEditForm] = useState({
//     type: "expense",
//     amount: "",
//     category: "Food",
//     date: new Date().toISOString().slice(0, 10),
//     paymentMethod: "upi",
//     notes: "",
//   });

//   async function load() {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await listTransactionsApi(filters);
//       const arr = Array.isArray(res?.data) ? res.data : res?.data?.items || [];
//       setItems(arr);
//     } catch (e) {
//       console.error(e);
//       setError("Failed to load transactions");
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filters.type, filters.from, filters.to]);

//   const totals = useMemo(() => {
//     let income = 0;
//     let expense = 0;
//     for (const t of items) {
//       const amt = Number(t.amount || 0);
//       const type = String(t.type || "").toLowerCase();
//       if (type === "income") income += amt;
//       else expense += amt;
//     }
//     return { income, expense, net: income - expense };
//   }, [items]);

//   async function onCreate(e) {
//     e.preventDefault();
//     setBusy(true);
//     setError("");

//     try {
//       const amt = Number(form.amount);
//       if (!Number.isFinite(amt) || amt <= 0) throw new Error("Enter a valid amount");

//       await createTransactionApi({
//         ...form,
//         amount: amt,
//         date: new Date(form.date).toISOString(),
//       });

//       setForm((p) => ({
//         ...p,
//         amount: "",
//         notes: "",
//       }));

//       await load();
//     } catch (e) {
//       setError(e?.message || "Failed to add transaction");
//     } finally {
//       setBusy(false);
//     }
//   }

//   async function onDelete(id) {
//     if (!confirm("Delete this transaction?")) return;
//     setBusy(true);
//     setError("");
//     try {
//       await deleteTransactionApi(id);
//       await load();
//     } catch (e) {
//       setError(e?.message || "Failed to delete transaction");
//     } finally {
//       setBusy(false);
//     }
//   }

//   function openEdit(t) {
//     setEditing(t);
//     setEditForm({
//       type: String(t.type || "expense").toLowerCase(),
//       amount: String(t.amount ?? ""),
//       category: t.category || "Food",
//       date: t.date ? String(t.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
//       paymentMethod: t.paymentMethod || "upi",
//       notes: t.notes || "",
//     });
//   }

//   async function onUpdate(e) {
//     e.preventDefault();
//     if (!editing) return;
//     setBusy(true);
//     setError("");

//     try {
//       const amt = Number(editForm.amount);
//       if (!Number.isFinite(amt) || amt <= 0) throw new Error("Enter a valid amount");

//       await updateTransactionApi(editing._id, {
//         ...editForm,
//         amount: amt,
//         date: new Date(editForm.date).toISOString(),
//       });

//       setEditing(null);
//       await load();
//     } catch (e) {
//       setError(e?.message || "Failed to update transaction");
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <AppPageHeader title="Transactions" subtitle="Add and track income/expenses" />

//       <div className="space-y-6">
//         <div className="grid gap-4 md:grid-cols-3">
//           <StatCard title="Income (Loaded)" value={totals.income} />
//           <StatCard title="Expense (Loaded)" value={totals.expense} />
//           <StatCard title="Net (Loaded)" value={totals.net} />
//         </div>

//         {/* Filters */}
//         <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
//           <h2 className="text-lg font-semibold">Filters</h2>
//           <div className="mt-4 grid gap-4 md:grid-cols-3">
//             <Field label="Type">
//               <select
//                 value={filters.type}
//                 onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
//                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//               >
//                 <option value="">All</option>
//                 <option value="income">Income</option>
//                 <option value="expense">Expense</option>
//               </select>
//             </Field>

//             <Field label="From">
//               <input
//                 type="date"
//                 value={filters.from}
//                 onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
//                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//               />
//             </Field>

//             <Field label="To">
//               <input
//                 type="date"
//                 value={filters.to}
//                 onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
//                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//               />
//             </Field>
//           </div>

//           <div className="mt-4 flex gap-2">
//             <button
//               onClick={() => setFilters({ type: "", from: "", to: "" })}
//               className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 hover:bg-slate-800"
//             >
//               Clear
//             </button>

//             <button
//               onClick={load}
//               disabled={busy || loading}
//               className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
//             >
//               Refresh
//             </button>
//           </div>

//           {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
//         </div>

//         {/* Create Transaction */}
//         <form
//           onSubmit={onCreate}
//           className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
//         >
//           <h2 className="text-lg font-semibold">Add Transaction</h2>

//           <div className="mt-4 grid gap-4 md:grid-cols-3">
//             <Field label="Type">
//               <select
//                 value={form.type}
//                 onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
//                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//               >
//                 <option value="income">Income</option>
//                 <option value="expense">Expense</option>
//               </select>
//             </Field>

//             <Field label="Amount">
//               <input
//                 value={form.amount}
//                 onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
//                 placeholder="e.g., 500"
//                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                 required
//               />
//             </Field>

//             <Field label="Category">
//               <input
//                 value={form.category}
//                 onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
//                 placeholder="e.g., Food, Rent, Custom Name"
//                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                 required
//               />
//             </Field>

//             <Field label="Date">
//               <input
//                 type="date"
//                 value={form.date}
//                 onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
//                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//               />
//             </Field>

//             <Field label="Payment Method">
//               <input
//                 value={form.paymentMethod}
//                 onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}
//                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                 placeholder="upi / cash / card"
//               />
//             </Field>

//             <Field label="Notes">
//               <input
//                 value={form.notes}
//                 onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
//                 className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                 placeholder="optional"
//               />
//             </Field>
//           </div>

//           <button
//             disabled={busy}
//             className="mt-5 rounded-xl bg-indigo-600 px-5 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-60"
//           >
//             {busy ? "Saving..." : "Add"}
//           </button>
//         </form>

//         {/* List */}
//         <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
//           <div className="p-5 border-b border-slate-800 flex items-center justify-between">
//             <h2 className="text-lg font-semibold">Transactions</h2>
//             <span className="text-sm text-slate-400">{items.length} items</span>
//           </div>

//           {loading ? (
//             <div className="p-6 text-slate-400">Loading...</div>
//           ) : items.length === 0 ? (
//             <div className="p-6 text-slate-400">No transactions yet.</div>
//           ) : (
//             <div className="p-5 overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="text-slate-400">
//                   <tr className="border-b border-slate-800">
//                     <th className="text-left py-2">Date</th>
//                     <th className="text-left py-2">Type</th>
//                     <th className="text-left py-2">Category</th>
//                     <th className="text-right py-2">Amount</th>
//                     <th className="text-right py-2">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {items.map((t) => (
//                     <tr key={t._id} className="border-b border-slate-800/60">
//                       <td className="py-3">{t.date ? String(t.date).slice(0, 10) : "-"}</td>
//                       <td className="py-3 capitalize">{String(t.type || "").toLowerCase()}</td>
//                       <td className="py-3">{t.category || "-"}</td>
//                       <td className="py-3 text-right">{formatINR(t.amount)}</td>
//                       <td className="py-3 text-right">
//                         <div className="flex justify-end gap-2">
//                           <button
//                             onClick={() => openEdit(t)}
//                             className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-950"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => onDelete(t._id)}
//                             className="rounded-lg border border-rose-700 bg-rose-950/30 px-3 py-1 text-rose-200 hover:bg-rose-900/40"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {editing ? (
//           <Modal title="Edit Transaction" onClose={() => setEditing(null)}>
//             <form onSubmit={onUpdate} className="grid gap-4">
//               <Field label="Type">
//                 <select
//                   value={editForm.type}
//                   onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
//                   className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                 >
//                   <option value="income">Income</option>
//                   <option value="expense">Expense</option>
//                 </select>
//               </Field>

//               <Field label="Amount">
//                 <input
//                   value={editForm.amount}
//                   onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
//                   className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                 />
//               </Field>

//               <Field label="Category">
//                 <input
//                   value={editForm.category}
//                   onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
//                   placeholder="e.g., Food, Rent, Custom Name"
//                   className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                   required
//                 />
//               </Field>

//               <Field label="Date">
//                 <input
//                   type="date"
//                   value={editForm.date}
//                   onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
//                   className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                 />
//               </Field>

//               <Field label="Payment Method">
//                 <input
//                   value={editForm.paymentMethod}
//                   onChange={(e) => setEditForm((p) => ({ ...p, paymentMethod: e.target.value }))}
//                   className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                 />
//               </Field>

//               <Field label="Notes">
//                 <input
//                   value={editForm.notes}
//                   onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
//                   className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
//                 />
//               </Field>

//               <div className="flex justify-end gap-2 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setEditing(null)}
//                   className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 hover:bg-slate-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-60"
//                   disabled={busy}
//                 >
//                   {busy ? "Saving..." : "Save Changes"}
//                 </button>
//               </div>
//             </form>
//           </Modal>
//         ) : null}
//       </div>
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <div>
//       <label className="text-sm text-slate-300">{label}</label>
//       <div className="mt-1">{children}</div>
//     </div>
//   );
// }

// function StatCard({ title, value }) {
//   return (
//     <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
//       <p className="text-slate-400 text-sm">{title}</p>
//       <p className="text-2xl font-semibold mt-2">{formatINR(value)}</p>
//     </div>
//   );
// }

// function Modal({ title, children, onClose }) {
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
//       onMouseDown={onClose}
//     >
//       <div
//         className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6"
//         onMouseDown={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold">{title}</h3>
//           <button
//             onClick={onClose}
//             className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-950"
//           >
//             Close
//           </button>
//         </div>
//         <div className="mt-4">{children}</div>
//       </div>
//     </div>
//   );
// }

// function formatINR(n) {
//   const num = Number(n) || 0;
//   return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num);
// }
import { useEffect, useMemo, useState } from "react";
import {
  createTransactionApi,
  deleteTransactionApi,
  listTransactionsApi,
} from "../../api/transaction.api";

const CATEGORY_OPTIONS = [
  "Food",
  "Rent",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Bills",
  "Salary",
  "Investment",
  "Other",
  "Custom",
];

const PAYMENT_METHOD_OPTIONS = [
  { label: "UPI", value: "upi" },
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Other", value: "other" },
  { label: "Custom", value: "custom" },
];

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toISODateInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Transactions() {
  // ===== Filters =====
  const [filterType, setFilterType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // ===== Create form =====
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(toISODateInputValue(new Date()));
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  // ===== Data =====
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of items) {
      if (t.type === "income") income += Number(t.amount || 0);
      if (t.type === "expense") expense += Number(t.amount || 0);
    }
    return { income, expense, net: income - expense };
  }, [items]);

  async function fetchTransactions() {
    setLoading(true);
    setErrMsg("");
    try {
      const params = { page: 1, limit: 50 };

      if (filterType !== "all") params.type = filterType;
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await listTransactionsApi(params);

      // Your API wrapper returns res.data (likely { success, data, message })
      // and your controller returns { items, page, limit... } inside `data`.
      const payload = res?.data || res;
      const list = payload?.items || payload?.data?.items || [];

      setItems(list);
    } catch (e) {
      setErrMsg(e?.response?.data?.message || e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setErrMsg("");

    // Build payload that matches your backend validator
    const payload = {
      type,
      amount: Number(amount),
      date: date, // backend accepts YYYY-MM-DD
      category: category === "Custom" ? "custom" : category,
      paymentMethod: paymentMethod,
      notes: notes || "",
    };

    if (category === "Custom") payload.customCategory = customCategory;
    if (paymentMethod === "custom") payload.customPaymentMethod = customPaymentMethod;

    try {
      await createTransactionApi(payload);

      // reset minimal fields
      setAmount("");
      setNotes("");
      if (category === "Custom") setCustomCategory("");
      if (paymentMethod === "custom") setCustomPaymentMethod("");

      await fetchTransactions();
    } catch (e) {
      setErrMsg(e?.response?.data?.message || e?.message || "Create failed");
    }
  }

  async function onDelete(id) {
    setErrMsg("");
    try {
      await deleteTransactionApi(id);
      await fetchTransactions();
    } catch (e) {
      setErrMsg(e?.response?.data?.message || e?.message || "Delete failed");
    }
  }

  function clearFilters() {
    setFilterType("all");
    setFrom("");
    setTo("");
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Transactions</h1>
        <p className="text-sm text-white/60">Add and track income/expenses</p>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Income (Loaded)</div>
          <div className="mt-1 text-xl font-semibold text-white">₹{formatMoney(totals.income)}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Expense (Loaded)</div>
          <div className="mt-1 text-xl font-semibold text-white">₹{formatMoney(totals.expense)}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Net (Loaded)</div>
          <div className="mt-1 text-xl font-semibold text-white">₹{formatMoney(totals.net)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 mb-6">
        <div className="mb-3 text-sm font-medium text-white">Filters</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-white/60">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/60">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={fetchTransactions}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Refresh
          </button>

          {loading && <span className="text-sm text-white/60">Loading...</span>}
          {!!errMsg && <span className="text-sm text-red-400">{errMsg}</span>}
        </div>
      </div>

      {/* Add Transaction */}
      <form onSubmit={onCreate} className="rounded-xl border border-white/10 bg-white/5 p-5 mb-6">
        <div className="mb-3 text-sm font-medium text-white">Add Transaction</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-white/60">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/60">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Category dropdown + custom */}
          <div>
            <label className="text-xs text-white/60">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {category === "Custom" && (
              <input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category"
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
              />
            )}
          </div>

          {/* Payment method dropdown + custom */}
          <div>
            <label className="text-xs text-white/60">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            >
              {PAYMENT_METHOD_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {paymentMethod === "custom" && (
              <input
                value={customPaymentMethod}
                onChange={(e) => setCustomPaymentMethod(e.target.value)}
                placeholder="Enter custom payment method"
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
              />
            )}
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-white/60">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="optional"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Add
          </button>

          <span className="text-xs text-white/50">
            Tip: Choose <b>Custom</b> to type your own Category/Payment Method.
          </span>
        </div>
      </form>

      {/* Transactions table */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-white">Transactions</div>
          <div className="text-xs text-white/60">{items.length} items</div>
        </div>

        {items.length === 0 ? (
          <div className="text-sm text-white/60">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white">
              <thead className="text-xs text-white/70">
                <tr className="border-b border-white/10">
                  <th className="py-3 text-left font-medium">Date</th>
                  <th className="py-3 text-left font-medium">Type</th>
                  <th className="py-3 text-left font-medium">Category</th>
                  <th className="py-3 text-right font-medium">Amount</th>
                  <th className="py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => {
                  const d = toISODateInputValue(t.date);
                  const isExpense = t.type === "expense";
                  return (
                    <tr key={t._id} className="border-b border-white/5">
                      <td className="py-3 text-white/80">{d}</td>
                      <td className="py-3">{t.type}</td>
                      <td className="py-3 text-white/80">{t.category}</td>
                      <td className={`py-3 text-right ${isExpense ? "text-red-400" : "text-green-400"}`}>
                        {isExpense ? "-" : "+"}₹{formatMoney(t.amount)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDelete(t._id)}
                          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10"
                        >
                          Delete
                        </button>
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
  );
}
