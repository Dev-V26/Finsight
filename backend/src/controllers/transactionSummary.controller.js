import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import Transaction from "../models/Transaction.js";

export const monthSummary = asyncHandler(async (req, res) => {
  // month format: YYYY-MM (e.g., 2026-01). If not provided, use current month.
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const m = Number(monthStr);

  if (!year || !m || m < 1 || m > 12) {
    return res.status(400).json({
      success: false,
      message: "Invalid month. Use YYYY-MM (e.g., 2026-01)."
    });
  }

  const start = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, m, 1, 0, 0, 0));

  const agg = await Transaction.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" }
      }
    }
  ]);

  let income = 0;
  let expense = 0;

  for (const row of agg) {
    if (row._id === "income") income = row.total;
    if (row._id === "expense") expense = row.total;
  }

  return ok(
    res,
    {
      month,
      income,
      expense,
      net: income - expense
    },
    "Month summary"
  );
});
