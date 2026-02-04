import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok, fail } from "../utils/apiResponse.js";
import { toMonthKey } from "../utils/month.js";
import { runBudgetAlertsForMonth } from "../utils/budgetAlert.js";
import Notification from "../models/Notification.js";
import { detectAnomalies } from "../utils/anomalyEngine.js";

import {
  createTransactionSchema,
  updateTransactionSchema
} from "../validators/transaction.validation.js";

export const createTransaction = asyncHandler(async (req, res) => {
  const parsed = createTransactionSchema.parse(req.body);

  const txn = await Transaction.create({
    userId: req.user._id,
    type: parsed.type,
    amount: parsed.amount,
    category: parsed.category,
    date: new Date(parsed.date),
    paymentMethod: parsed.paymentMethod || "other",
    notes: parsed.notes || ""
  });

  // ✅ REAL-TIME budget notifications (only for expense)
  if (txn.type === "expense") {
    const month = toMonthKey(txn.date);
    await runBudgetAlertsForMonth({ userId: req.user._id, month });
  }

  // ✅ Light AI: anomaly detection -> creates "unusual_activity" notifications
  try {
    const anomalies = await detectAnomalies({ userId: req.user._id, transaction: txn });
    for (const a of anomalies) {
      const dedupeKey = `unusual_activity:${txn._id}:${a.type}`;
      await Notification.create({
        userId: req.user._id,
        kind: "unusual_activity",
        title: a.title,
        message: a.message,
        severity: a.severity || "warning",
        read: false,
        dedupeKey,
        meta: {
          transactionId: txn._id,
          anomalyType: a.type,
          ...a.meta,
        },
      }).catch(() => {
        // ignore duplicate key errors (already created)
      });
    }
  } catch {
    // never block transaction creation
  }


  return created(res, txn, "Transaction created");
});


export const listTransactions = asyncHandler(async (req, res) => {
  const { type, category, from, to, page = "1", limit = "10" } = req.query;

  const q = { userId: req.user._id };

  if (type) q.type = type;
  if (category) q.category = category;

  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Transaction.find(q).sort({ date: -1 }).skip(skip).limit(limitNum),
    Transaction.countDocuments(q)
  ]);

  return ok(res, {
    items,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum)
  }, "Transactions");
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail(res, 400, "Invalid id");

  const parsed = updateTransactionSchema.parse(req.body);

  const update = { ...parsed };
  if (parsed.date) update.date = new Date(parsed.date);

  const txn = await Transaction.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { $set: update },
    { new: true }
  );

  if (!txn) return fail(res, 404, "Transaction not found");

  return ok(res, txn, "Transaction updated");
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail(res, 400, "Invalid id");

  const txn = await Transaction.findOneAndDelete({ _id: id, userId: req.user._id });
  if (!txn) return fail(res, 404, "Transaction not found");

  return ok(res, null, "Transaction deleted");
});
