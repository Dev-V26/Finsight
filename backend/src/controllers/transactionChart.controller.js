import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import Transaction from "../models/Transaction.js";

export const incomeExpenseByMonth = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getUTCFullYear();

  const data = await Transaction.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: {
          $gte: new Date(Date.UTC(year, 0, 1)),
          $lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$date" }, type: "$type" },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const result = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
  }));

  for (const row of data) {
    const idx = row._id.month - 1;
    if (row._id.type === "income") result[idx].income = row.total;
    if (row._id.type === "expense") result[idx].expense = row.total;
  }

  return ok(res, result, "Income vs Expense by month");
});

export const expenseByCategory = asyncHandler(async (req, res) => {
  const data = await Transaction.aggregate([
    { $match: { userId: req.user._id, type: "expense" } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
  ]);

  return ok(res, data, "Expense by category");
});
