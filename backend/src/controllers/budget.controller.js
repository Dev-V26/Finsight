import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

export const createOrUpdateBudget = asyncHandler(async (req, res) => {
  const { category, amount, month } = req.body;

  if (!category || !amount || !month) {
    return fail(res, 400, "category, amount and month are required");
  }

  const budget = await Budget.findOneAndUpdate(
    { userId: req.user._id, category, month },
    { amount },
    { upsert: true, new: true }
  );

  return created(res, budget, "Budget saved");
});

export const listBudgets = asyncHandler(async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const budgets = await Budget.find({
    userId: req.user._id,
    month,
  }).lean();

  // Calculate used amount per category for the given month
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(new Date(start).setMonth(start.getMonth() + 1));

  const usage = await Transaction.aggregate([
    {
      $match: {
        userId: req.user._id,
        type: "expense",
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: "$category",
        used: { $sum: "$amount" },
      },
    },
  ]);

  const usageMap = Object.fromEntries(usage.map((u) => [u._id, u.used]));

  const result = budgets.map((b) => {
    const used = usageMap[b.category] || 0;
    const exceeded = used > b.amount;

    return {
      ...b,
      used,
      remaining: Math.max(b.amount - used, 0),
      exceeded,
    };
  });

  const exceededCount = result.filter((b) => b.exceeded).length;

  return ok(res, { month, exceededCount, items: result }, "Budgets");
});
