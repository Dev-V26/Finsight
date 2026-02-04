import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";
import Holding from "../models/Holding.js";
import Notification from "../models/Notification.js";

/**
 * Helpers
 */
function ymToRange(month) {
  // month: "YYYY-MM"
  const [y, m] = String(month).split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return null;
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 1, 0, 0, 0, 0); // exclusive
  return { start, end };
}

function toYMD(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function sumAmount(items) {
  return items.reduce((s, t) => s + Number(t.amount || 0), 0);
}

export const getDashboardInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // Default month = current month
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const month = (req.query.month || defaultMonth).trim();

    const range = ymToRange(month);
    if (!range) {
      return res.status(400).json({ message: "Invalid month. Expected YYYY-MM." });
    }

    const { start, end } = range;

    /**
     * 1) Transactions for selected month
     */
    const monthTxns = await Transaction.find({
      userId,
      date: { $gte: start, $lt: end },
    })
      .sort({ date: -1 })
      .lean();

    const monthIncomeTxns = monthTxns.filter((t) => t.type === "income");
    const monthExpenseTxns = monthTxns.filter((t) => t.type === "expense");

    const income = sumAmount(monthIncomeTxns);
    const expense = sumAmount(monthExpenseTxns);
    const netSavings = income - expense;

    /**
     * 2) Income vs Expense (daily series)
     * Output: [{ date: 'YYYY-MM-DD', income: n, expense: n }]
     */
    const dailyMap = new Map();

    for (const t of monthTxns) {
      const key = toYMD(t.date);
      if (!dailyMap.has(key)) dailyMap.set(key, { date: key, income: 0, expense: 0 });
      const row = dailyMap.get(key);

      const amt = Number(t.amount || 0);
      if (t.type === "income") row.income += amt;
      if (t.type === "expense") row.expense += amt;
    }

    const incomeVsExpense = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    /**
     * 3) Expense by Category (pie/bar)
     * Output: [{ category, amount }]
     */
    const categoryMap = new Map();
    for (const t of monthExpenseTxns) {
      const cat = t.category || "Uncategorized";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(t.amount || 0));
    }

    const expenseByCategory = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    /**
     * 4) Budgets status (for dashboard)
     * We assume Budget has: { userId, category, limit } (or amount/limit)
     * Output: [{ _id, category, limit, spent, remaining, percent, status }]
     */
    const budgets = await Budget.find({ userId }).lean();

    const budgetsStatus = budgets.map((b) => {
      const category = b.category || "Uncategorized";
      const limit = Number(b.limit ?? b.amount ?? 0);

      const spent = Number(categoryMap.get(category) || 0);
      const remaining = Math.max(limit - spent, 0);
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

      let status = "ok";
      if (limit > 0 && spent >= limit) status = "over";
      else if (limit > 0 && spent >= limit * 0.8) status = "near";

      return {
        _id: b._id,
        category,
        limit,
        spent,
        remaining,
        percent,
        status,
      };
    });

    // Budget alerts for dashboard card
    const budgetAlerts = budgetsStatus
      .filter((b) => b.status === "over" || b.status === "near")
      .slice(0, 5);

    /**
     * 5) Goals progress
     * We assume Goal has: { userId, title, targetAmount, currentAmount, deadline? }
     */
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).lean();

    const goalsProgress = goals.map((g) => {
      const target = Number(g.targetAmount || 0);
      const current = Number(g.currentAmount || 0);
      const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

      return {
        _id: g._id,
        title: g.title,
        targetAmount: target,
        currentAmount: current,
        percent,
        deadline: g.deadline || null,
      };
    });

    /**
     * 6) Portfolio snapshot (light)
     * We assume Holding has: { userId, name, assetType, quantity, buyPrice, currentPrice? }
     */
    const holdings = await Holding.find({ userId }).sort({ createdAt: -1 }).lean();

    const portfolio = {
      count: holdings.length,
      holdings: holdings.slice(0, 6).map((h) => ({
        _id: h._id,
        name: h.name,
        assetType: h.assetType,
        quantity: Number(h.quantity || 0),
        buyPrice: Number(h.buyPrice || 0),
        currentPrice: h.currentPrice != null ? Number(h.currentPrice) : null,
      })),
    };

    /**
     * 7) Recent transactions (dashboard list)
     */
    const recentTransactions = monthTxns.slice(0, 8).map((t) => ({
      _id: t._id,
      date: t.date,
      type: t.type,
      category: t.category || "Uncategorized",
      amount: Number(t.amount || 0),
      note: t.note || t.description || "",
    }));

    /**
     * 8) Unusual Activity (Anomaly Alerts) - unread notifications
     * Notification should support kind: "unusual_activity"
     * Output: [{ _id, title, message, severity, createdAt, read }]
     */
    const unusualActivity = await Notification.find({
      userId,
      kind: "unusual_activity",
      read: false,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    /**
     * Response (dashboard payload)
     */
    return res.json({
      month,
      summary: {
        income,
        expense,
        netSavings,
      },
      charts: {
        incomeVsExpense,
        expenseByCategory,
      },
      portfolio,
      budgetsStatus,
      budgetAlerts,
      goalsProgress,
      recentTransactions,
      unusualActivity,
    });
  } catch (err) {
    console.error("Insights error:", err);
    return res.status(500).json({ message: "Failed to load dashboard insights." });
  }
};
