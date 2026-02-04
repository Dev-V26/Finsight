import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import Notification from "../models/Notification.js";

function currentYYYYMM() {
  return new Date().toISOString().slice(0, 7);
}

function monthRange(month) {
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
  return { start, end };
}

async function safeCreateNotification(payload) {
  try {
    await Notification.create(payload);
  } catch (err) {
    if (err?.code === 11000) return; // dedupe hit, ignore
    throw err;
  }
}

export function defineBudgetAlertsJob(agenda) {
  agenda.define("budget-alerts", async () => {
    const month = currentYYYYMM();
    const { start, end } = monthRange(month);

    // IMPORTANT: budgets are per-user; we fetch all for this month
    const budgets = await Budget.find({ month }).lean();

    for (const b of budgets) {
      const usedAgg = await Transaction.aggregate([
        {
          $match: {
            userId: b.userId,
            type: "expense",
            category: b.category,
            date: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = usedAgg?.[0]?.total || 0;
      if (!b.amount || b.amount <= 0) continue;

      const pct = (spent / b.amount) * 100;

      if (pct >= 80 && pct < 100) {
        await safeCreateNotification({
          userId: b.userId,
          type: "BUDGET_ALERT",
          title: `Budget Warning: ${b.category}`,
          message: `You’ve used ${Math.round(pct)}% of your ${b.category} budget this month.`,
          meta: { budgetId: b._id, category: b.category, month, spent, budget: b.amount, pct },
          read: false,
          dedupeKey: `budget:${b._id}:month:${month}:threshold:80`,
          severity: "warning",
        });
      }

      if (pct >= 100) {
        await safeCreateNotification({
          userId: b.userId,
          type: "BUDGET_ALERT",
          title: `Budget Exceeded: ${b.category}`,
          message: `You’ve exceeded your ${b.category} budget (${Math.round(pct)}%).`,
          meta: { budgetId: b._id, category: b.category, month, spent, budget: b.amount, pct },
          read: false,
          dedupeKey: `budget:${b._id}:month:${month}:threshold:100`,
          severity: "critical",
        });
      }
    }
  });
}
